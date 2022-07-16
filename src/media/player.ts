import { join } from 'node:path';
import { readdir } from 'node:fs/promises';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus
} from '@discordjs/voice';
import { Downloader } from '@discord-player/downloader';
import play from 'play-dl';
import {
  CommandInteraction,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageOptions,
  TextChannel,
  VoiceChannel
} from 'discord.js';
import { shuffle } from '@limitlesspc/limitless';
import type { AudioResource } from '@discordjs/voice';

import Queue from './queue';
import { SoundCloudMedia, SpotifyMedia, URLMedia, YouTubeMedia } from './media';

import type { MediaType } from './media';

export default class Player {
  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause
    }
  })
    .on(AudioPlayerStatus.Idle, async () => {
      if (this.soundboardCollector) return;

      try {
        if (this.queue.size) {
          await this.joinVoice();
          await this.play();
        } else await this.stop();
      } catch (error) {
        console.error('⚠️ Player error:', error);
        await this.send('⚠️ Error');
        await this.next();
      }
    })
    .on('error', async error => {
      console.error('⚠️ Player error:', error);
      try {
        await this.send('⚠️ Error');
        await this.next();
      } catch (error) {
        console.error('⚠️ Error:', error);
      }
    });

  channel?: TextChannel;
  private voiceChannel?: VoiceChannel;
  connection?: VoiceConnection;
  private message?: Message;

  private soundboardCollector:
    | InteractionCollector<MessageComponentInteraction>
    | undefined;

  readonly queue = new Queue();
  timestamp = 0;

  constructor(private onStop: () => void) {}

  async send(message: string | MessageOptions): Promise<void> {
    await this.message?.delete().catch(() => {});
    this.message = await this.channel?.send(message);
  }

  setChannels(i: CommandInteraction): void {
    const { guild, channel, member } = i;
    if (channel?.type === 'GUILD_TEXT') this.channel = channel;
    if (!guild || !member) return;
    const guildMember = guild.members.cache.get(member.user.id);
    const voiceChannel = guildMember?.voice.channel;
    if (voiceChannel?.type === 'GUILD_VOICE') this.voiceChannel = voiceChannel;
  }

  async getMedias(i: CommandInteraction, query?: string): Promise<MediaType[]> {
    const requester = i.user;

    const queries: string[] = [];
    if (query) {
      const words = query.split(' ');
      let text = '';
      for (const word of words) {
        const isUrl = Downloader.validate(word);
        if (isUrl) {
          if (text) {
            queries.push(text.trim());
            text = '';
          }
          queries.push(word);
        } else text += `${word} `;
      }
      if (text) {
        queries.push(text.trim());
        text = '';
      }
    }
    console.log('Queries:', queries);

    const medias: MediaType[] = [];
    const mediasCache = new Map<string, MediaType[]>();
    if (play.is_expired()) await play.refreshToken();
    for (const query of queries) {
      const mds = mediasCache.get(query);
      if (mds) {
        medias.push(...mds);
        continue;
      }
      if (play.yt_validate(query) === 'playlist') {
        const id = play.extractID(query);
        try {
          const videos = await YouTubeMedia.fromPlaylistId(id, requester);
          medias.push(...videos);
          mediasCache.set(query, videos);
        } catch (error) {
          await this.send('🚫 Invalid YouTube playlist url');
        }
      } else if (play.yt_validate(query) === 'video') {
        try {
          const media = await YouTubeMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid YouTube video url');
        }
      } else if (play.sp_validate(query) === 'track') {
        try {
          const media = await SpotifyMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid Spotify song url');
        }
      } else if (
        ['album', 'playlist'].includes(play.sp_validate(query) as string)
      ) {
        try {
          const songs = await SpotifyMedia.fromListURL(query, requester);
          medias.push(...songs);
          mediasCache.set(query, songs);
        } catch {
          await this.send('🚫 Invalid Spotify album/playlist url');
        }
      } else if ((await play.so_validate(query)) === 'track') {
        try {
          const media = await SoundCloudMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid SoundCloud song url');
        }
      } else if ((await play.so_validate(query)) === 'playlist') {
        try {
          const medias = await SoundCloudMedia.fromListURL(query, requester);
          medias.push(...medias);
          mediasCache.set(query, medias);
        } catch {
          await this.send('🚫 Invalid SoundCloud playlist url');
        }
      } else if (Downloader.validate(query)) {
        try {
          const media = await URLMedia.fromURL(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          await this.send('🚫 Invalid song url');
        }
      } else {
        try {
          const media = await YouTubeMedia.fromSearch(query, requester);
          medias.push(media);
          mediasCache.set(query, [media]);
        } catch {
          this.send('🚫 Invalid YouTube query');
        }
      }
    }
    medias.forEach(media => media.log());
    return medias;
  }

  async add(
    i: CommandInteraction,
    query?: string,
    shuffle = false
  ): Promise<void> {
    this.setChannels(i);

    const { queue, channel } = this;

    const medias = await this.getMedias(i, query);
    queue.enqueue(...medias);
    if (shuffle) queue.shuffle();

    if (medias.length)
      await channel?.send(
        `⏏️ Added${shuffle ? ' & shuffled' : ''} ${medias
          .map(media => media.title)
          .slice(0, 10)
          .join(', ')}${medias.length > 10 ? ', …' : ''} to queue`
      );

    return this.play();
  }

  async next(): Promise<void> {
    return this.play(true);
  }

  async move(from: number, to: number): Promise<void> {
    const { queue } = this;
    const { length } = queue;
    from = (from + length) % length;
    to = (to + length) % length;
    queue.move(from + 1, to + 1);
    return this.send(`➡️ Moved #${from + 2} to #${to + 2}`);
  }

  async stop(): Promise<void> {
    const { player, connection, queue, onStop } = this;
    if (
      connection &&
      connection.state.status !== VoiceConnectionStatus.Destroyed
    )
      connection.destroy();
    player.stop();
    queue.clear();
    queue.loop = false;
    this.soundboardCollector?.stop();
    this.channel =
      this.voiceChannel =
      this.connection =
      this.soundboardCollector =
        undefined;
    this.queue.changeEmitter.removeAllListeners();
    onStop();
  }

  async soundboard(i: CommandInteraction): Promise<void> {
    const soundsPath = join(__dirname, '../../sounds');
    const fileNames = await readdir(soundsPath);
    const soundNames = fileNames.map(fileName => fileName.replace('.ogg', ''));
    const shuffledNames = shuffle(soundNames).slice(0, 4 * 5);

    const buttons = shuffledNames.map(soundName =>
      new MessageButton()
        .setCustomId(soundName)
        .setLabel(soundName)
        .setStyle('PRIMARY')
    );
    const rows: MessageActionRow[] = [];
    const columns = 4;
    for (let i = 0; i < buttons.length; i += columns) {
      const row: MessageActionRow = new MessageActionRow();
      row.addComponents(buttons.slice(i, i + columns));
      rows.push(row);
    }

    this.setChannels(i);
    await this.send({ content: '🎵 Soundboard', components: rows });
    console.log(`🎵 Soundboard created`);
    this.soundboardCollector?.stop();
    this.soundboardCollector = this.message
      ?.createMessageComponentCollector()
      .on('collect', async i => {
        if (i.customId === 'stop') {
          this.soundboardCollector?.stop();
          this.soundboardCollector = undefined;
          return;
        }
        this.joinVoice();

        const soundName = i.customId;
        console.log('Sound:', soundName);
        const soundPath = join(soundsPath, `${soundName}.ogg`);
        const resource = createAudioResource(soundPath, {
          inputType: StreamType.OggOpus
        });
        this.player.play(resource);

        try {
          await i?.update({});
        } catch (error) {
          console.error('Interaction error:', error);
        }
      });
  }

  private joinVoice() {
    const { player, voiceChannel, connection } = this;
    if (!voiceChannel) return;

    console.log(`From: voice connection ${connection?.state.status || 'gone'}`);

    switch (connection?.state.status) {
      case VoiceConnectionStatus.Ready:
      case VoiceConnectionStatus.Signalling:
      case VoiceConnectionStatus.Connecting:
        break;
      default:
        connection?.destroy();
        this.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        this.connection
          .on(VoiceConnectionStatus.Disconnected, () => this.joinVoice())
          .subscribe(player);
    }

    console.log(
      `To: voice connection ${this.connection?.state.status || 'gone'}`
    );
  }

  async play(skip = false): Promise<void> {
    const { player, queue } = this;

    if (this.soundboardCollector) {
      this.soundboardCollector.stop();
      this.soundboardCollector = undefined;
    }

    this.joinVoice();

    if (player.state.status === AudioPlayerStatus.Playing && !skip) return;

    const media = queue.next();
    if (!media) {
      await this.send('📭 Queue is empty');
      return this.stop();
    }

    const { title } = media;
    let resource: AudioResource;
    if (media instanceof YouTubeMedia || media instanceof SpotifyMedia) {
      if (play.is_expired()) await play.refreshToken();
    }
    if (media instanceof YouTubeMedia || media instanceof SoundCloudMedia) {
      const { url } = media;
      const stream = await play.stream(url, {
        seek: media instanceof YouTubeMedia ? media.time : undefined
      });
      resource = createAudioResource(stream.stream, { inputType: stream.type });
      console.log(`▶️ Playing ${url}`);
    } else if (media instanceof SpotifyMedia) {
      const stream = await play.stream(media.youtubeURL);
      resource = createAudioResource(stream.stream, { inputType: stream.type });
      console.log(`▶️ Playing ${media.url}`);
    } else if (media instanceof URLMedia) {
      const stream = Downloader.download(media.url);
      resource = createAudioResource(stream);
      console.log(`▶️ Playing ${media.url}`);
    } else {
      resource = createAudioResource(media.path);
      console.log(`▶️ Playing ${media.path}`);
    }

    player.play(resource);
    this.timestamp = 0;
    player.once(AudioPlayerStatus.Playing, () => {
      this.timestamp = this.connection?.receiver.connectionData.timestamp || 0;
    });

    const embed = media.getEmbed().setTitle(`▶️ Playing: ${title}`);
    return this.send({
      embeds: [embed]
    });
  }
}
