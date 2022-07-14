import { getPlayer } from '../players';
import woof from '$services/woof';
import command from '$services/command';

export default command(
  {
    desc: 'Moves song in the queue, where negative numbers go from the end of the queue.',
    options: {
      from: {
        type: 'int',
        desc: 'The song number to move'
      },
      to: {
        type: 'int',
        desc: 'The position to move the song to'
      }
    }
  },
  async (i, { from, to }) => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    return player.move(from, to);
  }
);
