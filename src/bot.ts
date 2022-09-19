/* eslint-disable import/no-cycle */
import { IntentsBitField } from 'discord.js';

import DiscordBot from '$services/bot';
import commands from './commands';
import help from './commands/help';
import players from './players';
import type Command from '$services/command';

const bot = new DiscordBot(
  process.env.NAME || '',
  '-',
  [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent
  ],
  process.env.TOKEN
).addCommands([help as unknown as Command, ...commands]);
bot.client.on('voiceStateUpdate', oldState => {
  if (
    oldState.channel?.members.has(process.env.DISCORD_BOT_ID || '') &&
    oldState.channel?.members.size === 1
  ) {
    const guildId = oldState.guild.id;
    const player = players.get(guildId);
    player?.stop();
  }
});
export default bot;
