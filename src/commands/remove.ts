import { ChannelType } from 'discord.js';
// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$services/command';

export default command(
  {
    name: 'remove',
    aliases: ['rm'],
    desc: 'Removes songs from the queue. You may use `last` to refer to the last song in the queue and `n-m` to specify a range.',
    args: [
      {
        name: 'n',
        type: 'string[]',
        desc: 'The song number to remove'
      }
    ] as const
  },
  async (message, [nStrs]) => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== ChannelType.GuildVoice)
      return message.reply(`${woof()}, you are not in a voice channel`);

    const indices: number[] = [];
    for (const str of nStrs) {
      if (str === 'last') indices.push(player.queue.length - 1);
      else if (str.includes('-')) {
        const [startStr = '1', endStr = '1'] = str.split('-');
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        for (let n = start; n <= end; n++) {
          indices.push(n - 2);
        }
      } else {
        const n = parseInt(str);
        indices.push(n - 2);
      }
    }
    console.log('indices:', indices);

    for (const i of indices) {
      if (isNaN(i) || i < 0 || i >= player.queue.length)
        return message.reply(`${woof()}, please provide a valid numbers`);
    }

    return player.remove(...indices);
  }
);
