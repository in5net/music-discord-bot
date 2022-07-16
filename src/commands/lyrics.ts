import { MessageAttachment } from 'discord.js';

import command from '$services/command';
import { getLyrics } from '$services/genius';
import { getPlayer } from '../players';
import { SpotifyMedia } from '../media/media';

export default command(
  {
    desc: 'Gives you the lyrics of the current song or song by name',
    options: {
      song_name: {
        type: 'string',
        desc: 'The name of the song to get the lyrics of',
        optional: true
      }
    }
  },
  async (i, { song_name }) => {
    const { guildId } = i;
    if (!guildId) return;
    const player = getPlayer(guildId);

    let lyrics: string | undefined;
    if (song_name) lyrics = await getLyrics(song_name);
    const { current } = player.queue;
    if (current) {
      const { title } = current;
      if (current instanceof SpotifyMedia)
        lyrics = await getLyrics(`${title} ${current.artist.name}`);
      else lyrics = await getLyrics(title);
    } else lyrics = 'No song playing';

    if (!lyrics) return i.reply('No lyrics found');
    if (lyrics.length <= 2000) return i.reply(lyrics);
    return i.reply({
      files: [new MessageAttachment(Buffer.from(lyrics), 'lyrics.txt')]
    });
  }
);
