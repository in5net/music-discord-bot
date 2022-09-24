import { ChannelType } from 'discord.js';

import { getPlayer } from '../players.js';
import woof from '$services/woof.js';
import { command } from '$services/command.js';

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

function str2Seconds(str: string): number {
  const parts = str.split(':').map(x => parseInt(x));
  switch (parts.length) {
    case 1: {
      const [seconds] = parts;
      if (seconds === undefined || isNaN(seconds))
        throw new Error('Invalid time');
      return seconds;
    }
    case 2: {
      const [minutes, seconds] = parts;
      if (minutes === undefined || isNaN(minutes))
        throw new Error('Invalid minutes');
      if (seconds === undefined || isNaN(seconds))
        throw new Error('Invalid seconds');
      return minutes * 60 + seconds;
    }
    case 3: {
      const [hours, minutes, seconds] = parts;
      if (hours === undefined || isNaN(hours)) throw new Error('Invalid hours');
      if (minutes === undefined || isNaN(minutes))
        throw new Error('Invalid minutes');
      if (seconds === undefined || isNaN(seconds))
        throw new Error('Invalid seconds');
      return hours * 3600 + minutes * 60 + seconds;
    }
    default:
      throw new Error('Invalid time');
  }
}
