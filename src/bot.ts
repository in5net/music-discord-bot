/* eslint-disable import/no-cycle */
import '$services/env';
import DiscordBot from '$services/bot';
import commands from './commands';
import help from './commands/help';
import players from './players';
import type Command from '$services/command';

const bot = new DiscordBot(
  process.env.NAME || '',
  '-',
  ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES'],
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
