import { ChannelType } from 'discord.js';

import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$services/command';

export default command(
  {
    name: 'seek',
    desc: 'Go to a specific time in the current song',
    args: [
      {
        name: 'time',
        type: 'int',
        desc: 'The time in seconds'
      }
    ] as const
  },
  async (message, [time]) => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== ChannelType.GuildVoice)
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.seek(message, time);
  }
);
