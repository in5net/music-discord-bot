import { getPlayer } from '../players';
import woof from '$services/woof';
import command from '$services/command';

export default command(
  {
    desc: 'Skips a song and plays the next one',
    options: {}
  },
  async i => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    await player.next();
    return i.reply('⏩ Next');
  }
);
