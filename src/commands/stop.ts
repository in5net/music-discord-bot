import { getPlayer } from '../players';
import woof from '$services/woof';
import command from '$services/command';

export default command(
  {
    desc: 'Leaves the voice channel and clears the queue',
    options: {}
  },
  async i => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    return player.stop();
  }
);
