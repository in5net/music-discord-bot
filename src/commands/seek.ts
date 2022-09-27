import { ChannelType } from 'discord.js';

import woof from '$services/woof.js';
import { command } from '$services/command.js';
import { str2Seconds } from '$services/time.js';
import { getPlayer } from '../players.js';

export default command(
  {
    name: 'seek',
    desc: 'Go to a specific time in the current song',
    args: [
      {
        name: 'time',
        type: 'string',
        desc: 'The time to seek to (HH?:MM?:SS)'
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

    const seconds = str2Seconds(time);
    return player.seek(message, seconds);
  }
);
