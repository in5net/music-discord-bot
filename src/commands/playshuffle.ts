import { ChannelType } from 'discord.js';

import { getPlayer } from '../players.js';
import woof from '$services/woof.js';
import { command } from '$services/command.js';

export default command(
  {
    name: 'playshuffle',
    aliases: ['ps'],
    desc: 'Adds and shuffles the queue',
    args: [
      {
        name: 'query',
        type: 'string[]',
        desc: 'The URLs or YouTube searches to play',
        optional: true
      }
    ] as const
  },
  async (message, [query]) => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== ChannelType.GuildVoice)
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.add(message, query?.join(' '), true);
  }
);
