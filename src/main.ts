import {
  AutocompleteInteraction,
  CommandInteraction,
  MessageEmbed
} from 'discord.js';

import client from './client';
import * as rawCommands from './commands';
import type {
  Command,
  CommandGroups,
  Commands,
  OptionValue
} from '$services/command';

const commands = Object.fromEntries(
  Object.entries(rawCommands as unknown as Commands | CommandGroups).map(
    ([name, command]) => [name, normalize(command)]
  )
);
function normalize(
  command: Command | Commands | CommandGroups
): Command | Commands | CommandGroups {
  if (typeof command.desc === 'string') return command as Command;

  const { default: oddNameCommands = {}, ...normalCommands } =
    command as unknown as Commands | CommandGroups;
  return Object.fromEntries(
    Object.entries({ ...oddNameCommands, ...normalCommands }).map(
      ([subName, subCommand]) => [
        subName,
        normalize(subCommand as Command | Commands) as Command
      ]
    )
  );
}

function getCommand(
  i: CommandInteraction | AutocompleteInteraction
): Command | void {
  const command = commands[i.commandName];
  if (!command) return;

  const subGroupName = i.options.getSubcommandGroup(false);
  if (subGroupName) {
    const subGroup = (command as CommandGroups)[subGroupName];
    if (!subGroup) return;

    const subName = i.options.getSubcommand();
    const subCommand = subGroup[subName];
    return subCommand;
  }

  const subName = i.options.getSubcommand(false);
  if (subName) {
    const subCommand = (command as Commands)[subName];
    return subCommand;
  }

  return command as Command;
}

client
  .on('interactionCreate', async i => {
    if (i.isCommand()) {
      const command = getCommand(i);
      if (!command) return;

      const { options, handler } = command;
      try {
        await handler(
          i,
          Object.fromEntries(
            Object.entries(options).map(([name, { type, default: d }]) => {
              let value: OptionValue | null;
              switch (type) {
                case 'string':
                  value = i.options.getString(name);
                  break;
                case 'int':
                  value = i.options.getInteger(name);
                  break;
                case 'float':
                  value = i.options.getNumber(name);
                  break;
                case 'bool':
                  value = i.options.getBoolean(name);
                  break;
                case 'user':
                  value = i.options.getUser(name);
                  break;
                case 'choice':
                  value = i.options.getString(name);
                  break;
                case 'attachment':
                  value = i.options.getAttachment(name);
                  break;
              }
              return [
                name,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                (value ?? d)!
              ];
            })
          )
        );
      } catch (error) {
        const name = [
          i.commandName,
          i.options.getSubcommandGroup(),
          i.options.getSubcommand()
        ]
          .filter(Boolean)
          .join(' ');
        console.error(`Error while running command '${name}':`, error);
        if (error instanceof Error)
          return i
            .reply({
              embeds: [
                new MessageEmbed()
                  .setColor('RED')
                  .setTitle('Error')
                  .setDescription(error.message)
                  .setTimestamp()
              ],
              ephemeral: true
            })
            .catch(console.error);
      }
    } else if (i.isAutocomplete()) {
      const command = getCommand(i);
      if (!command) return;

      const option = i.options.getFocused(true);
      const handleAutocomplete = command.options[option.name]?.autocomplete;
      if (!handleAutocomplete) return;

      const options = await handleAutocomplete(option.value);
      return i
        .respond(
          options.map(o => ({
            name: o,
            value: o
          }))
        )
        .catch(console.error);
    }
  })
  .on('interactionError', console.error);
