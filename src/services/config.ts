import type { EmbedBuilder } from 'discord.js';

export const color = 0xfcc203;
export const ownerUsername = 'limitlesspc#2437';
export function addOwnerUsername(embed: EmbedBuilder) {
  const text = embed.data.footer?.text;
  const texts: string[] = [];
  if (text) texts.push(text);
  texts.push(`Thor Music by ${ownerUsername}`);
  if (text)
    embed.setFooter({
      text: texts.join(' • '),
      iconURL: embed.data.footer?.icon_url
    });
}
