import play from './play.js';
import playnow from './playnow.js';
import queue from './queue.js';
import next from './next.js';
import pause from './pause.js';
import shuffle from './shuffle.js';
import playshuffle from './playshuffle.js';
import loop from './loop.js';
import move from './move.js';
import remove from './remove.js';
import seek from './seek.js';
import stop from './stop.js';
import soundboard from './soundboard.js';
import lyrics from './lyrics.js';
import playlist from './playlist.js';
import hz from './hz.js';
import playnext from './playnext.js';
import type Command from '$services/command.js';

const commands: Command[] = [
  play,
  playnow,
  queue,
  next,
  pause,
  shuffle,
  playshuffle,
  loop,
  move,
  remove,
  seek,
  stop,
  soundboard,
  lyrics,
  playlist,
  hz,
  playnext
] as unknown as Command[];
export default commands;
