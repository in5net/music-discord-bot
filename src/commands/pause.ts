import { AudioPlayerStatus } from '@discordjs/voice';

import woof from '$services/woof';
import command from '$services/command';
import { getPlayer } from '../players';

export default command(
  {
    desc: 'Pauses/unpauses the current song',
    options: {}
  },
  async i => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    const paused = player.player.state.status === AudioPlayerStatus.Paused;
    if (paused) await player.player.unpause();
    else await player.player.pause(true);
    return i.reply(paused ? '⏯️ Resumed' : '⏸️ Paused');
  }
);
