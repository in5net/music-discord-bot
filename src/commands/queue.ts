import { getPlayer } from '../players';
import command from '$services/command';

export default command(
  {
    desc: "Shows what's in the queue or details about song #n",
    options: {
      n: {
        type: 'int',
        desc: 'The song number to show details about',
        optional: true
      }
    }
  },
  async (i, { n }) => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);

    if (typeof n === 'number') {
      const embed = player.queue.songEmbed(n - 1);
      if (embed) return i.reply({ embeds: [embed] });
      return i.reply(`Song #${n} not found in queue`);
    }

    player.setChannels(i);
    const { channel, connection, queue, timestamp } = player;
    if (channel)
      await queue.embed(
        channel,
        (connection?.receiver.connectionData.timestamp || 0) - timestamp
      );
  }
);
