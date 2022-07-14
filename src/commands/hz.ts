import { MessageAttachment } from 'discord.js';

import wav from '$services/wavstream';
import command from '$services/command';

export default command(
  {
    desc: 'Plays a sound at a given frequency for a given duration',
    options: {
      frequency: {
        type: 'int',
        desc: 'The frequency of the sound in hz',
        min: 0
      },
      duration: {
        type: 'float',
        desc: 'The duration of the sound in seconds',
        min: 0,
        default: 1
      }
    }
  },
  async (i, { frequency, duration }) => {
    const stream = wav(frequency, duration);
    return i.reply({
      files: [new MessageAttachment(stream, `${frequency}.wav`)]
    });
  }
);
