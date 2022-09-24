import { ChannelType } from 'discord.js';

import { getPlayer } from '../players.js';
import woof from '$services/woof.js';
import { command } from '$services/command.js';

export default command(
  {
    name: 'soundboard',
    aliases: ['sb'],
    desc: 'Gives you a bunch of buttons to play random sounds!',
    args: [] as const
  },
  async message => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== ChannelType.GuildVoice)
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.soundboard(message);
  }
);
