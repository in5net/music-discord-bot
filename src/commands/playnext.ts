import { getPlayer } from '../players';
import woof from '$services/woof';
import command from '$services/command';

export default command(
  {
    desc: 'Adds a song url or YouTube search to the front of the queue',
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

    await player.add(i, query);
    return player.move(-1, 1);
  }
);
