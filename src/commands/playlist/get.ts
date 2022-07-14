import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

import command from '$services/command';
import { secondsToTime } from '$services/time';
import { color } from '$services/config';
import { autocomplete, get } from './playlist';

export default command(
  {
    desc: 'Shows the songs in your named playlist',
    options: {
      name: {
        type: 'string',
        desc: 'The name of the playlist to show',
        autocomplete
      }
    }
  },
  async (i, { name }) => {
    const medias = await get(i.user, name).catch(() => []);
    const { length } = medias;

    const embed = new MessageEmbed()
      .setTitle('Tracks')
      .setColor(color)
      .setAuthor({
        name: i.user.username,
        iconURL: i.user.avatarURL() || undefined
      });
    const backButton = new MessageButton()
      .setCustomId('back')
      .setEmoji('⬅️')
      .setStyle('PRIMARY');
    const nextButton = new MessageButton()
      .setCustomId('next')
      .setEmoji('➡️')
      .setStyle('PRIMARY');
    const row = new MessageActionRow().addComponents(backButton, nextButton);

    let page = 0;
    const pageSize = 5;

    const generateEmbed = () => {
      embed.fields = [];
      backButton.setDisabled(!page);
      nextButton.setDisabled(page * pageSize + pageSize >= length);
      embed.setFooter({
        text: `Page ${page + 1}/${Math.ceil(
          length / pageSize
        )}, total: ${length}`
      });

      for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
        const media = medias[i];
        if (!media) break;
        const { title, duration } = media;
        embed.addField(`${i + 1}. ${title}`, `${secondsToTime(duration)}`);
      }
    };
    generateEmbed();

    await i.reply({ embeds: [embed], components: [row] });
    i.channel
      ?.createMessageComponentCollector({ time: 60_000 })
      .on('collect', async i => {
        const { customId } = i;
        if (customId === 'back') page--;
        else if (customId === 'next') page++;
        generateEmbed();
        await i.editReply({ embeds: [embed], components: [row] });
      })
      .once('end', async () => {
        await i.editReply({ embeds: [embed] });
      });
  }
);
