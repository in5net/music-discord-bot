import { getPlayer } from '../players';
import woof from '$services/woof';
import command from '$services/command';

export default command(
  {
    desc: 'Adds a song url or YouTube search to the front of the queue and starts playing it',
    options: {
      query: {
        type: 'string',
        desc: 'The URLs or YouTube searches to play'
      }
    }
  },
  async (i, { query }) => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    player.setChannels(i);
    const medias = await player.getMedias(i, query);
    player.queue.enqueueNow(...medias);

    if (medias.length)
      await i.reply(
        `⏏️ Added ${medias
          .map(media => media.title)
          .slice(0, 10)
          .join(', ')}${
          medias.length > 10 ? ', …' : ''
        } to the front of the queue`
      );

    return player.play(true);
  }
);
