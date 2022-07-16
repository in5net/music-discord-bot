import { getPlayer } from '../players';
import woof from '$services/woof';
import command from '$services/command';

export default command(
  {
    desc: 'Removes song #n from the queue, where negative numbers go from the end of the queue',
    options: {
      n: {
        type: 'int',
        desc: 'The song number to remove'
      }
    }
  },
  async (i, { n }) => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    const { queue } = player;
    const { length } = queue;
    const index = (n - 1 + length) % length;
    queue.remove(index);
    return i.reply(`✂️ Removed #${n + 2}`);
  }
);
