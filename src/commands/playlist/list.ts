import { MessageEmbed } from 'discord.js';

import command from '$services/command';
import { color } from '$services/config';
import { list } from './playlist';

export default command(
  {
    desc: 'Shows a list of your saved playlists',
    options: {}
  },
  async i => {
    const playlists = await list(i.user.id);
    const desc = playlists.join('\n');
    const embed = new MessageEmbed()
      .setTitle('Playlists')
      .setColor(color)
      .setAuthor({
        name: i.user.id,
        iconURL: i.user.avatarURL() || undefined
      })
      .setDescription(
        desc.length > 1000 ? `${desc.slice(0, 1000 - 1)}…` : desc
      );
    return i.reply({ embeds: [embed] });
  }
);
