import type { CommandInteraction, MessageAttachment, User } from 'discord.js';

export interface CommandOptionType {
  string: string;
  int: number;
  float: number;
  bool: boolean;
  user: User;
  choice: string;
  attachment: MessageAttachment;
}
type Type = keyof CommandOptionType;

type Choices = readonly string[] | Record<string, string>;
type ValueFromChoices<T extends Choices> = T extends readonly string[]
  ? T[number]
  : T[keyof T];

export type AutocompleteHandler = (option: string) => Promise<string[]>;
interface Option<T extends Type = Type, C extends Choices = Choices> {
  type: T;
  desc: string;
  min?: number;
  max?: number;
  choices?: C;
  optional?: boolean;
  default?: CommandOptionType[T];
  autocomplete?: AutocompleteHandler;
}
type Options = Record<string, Option>;
type SubOptions = Record<string, Options>;

type ValueFromOption<T extends Option> = T['choices'] extends Choices
  ? ValueFromChoices<T['choices']>
  : CommandOptionType[T['type']];
export type OptionValue<T extends Option = Option> =
  T['default'] extends CommandOptionType[Type]
    ? ValueFromOption<T>
    : T['optional'] extends true
    ? ValueFromOption<T> | undefined
    : ValueFromOption<T>;

type Handler<T extends Options = Options> = (
  i: CommandInteraction,
  options: {
    [K in keyof T]: OptionValue<T[K]>;
  }
) => void;

interface CommandOptions<T extends Options> {
  desc: string;
  options: T;
}
export interface Command<
  T extends Options = Options,
  S extends SubOptions = SubOptions
> extends CommandOptions<T> {
  handler: Handler<T>;
  subcommands?: {
    [K in keyof S]: Command<S[K]>;
  };
}
export type Commands = Record<string, Command>;
export type CommandGroups = Record<string, Commands>;

const command = <T extends Options, S extends SubOptions>(
  options: CommandOptions<T>,
  handler: Handler<T>,
  subcommands?: {
    [K in keyof S]: Command<S[K]>;
  }
): Command<T, S> => ({ ...options, handler, subcommands });
export default command;
