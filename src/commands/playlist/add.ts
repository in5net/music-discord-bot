import command from '$services/command';
import woof from '$services/woof';
import { getPlayer } from '../../players';
import { add, autocomplete } from './playlist';

export default command(
  {
    desc: 'Adds the songs from a query or the queue to your named playlist',
    options: {
      name: {
        type: 'string',
        desc: 'The name of the playlist to add to',
        autocomplete
      },
      query: {
        type: 'string',
        desc: 'The query to add',
        optional: true
      }
    }
  },
  async (i, { name, query }) => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    const medias = await player.getMedias(i, query);
    await add(i.user.id, name, medias);
    return i.reply(`Added to playlist ${name}`);
  }
);
