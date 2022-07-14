import command from '$services/command';
import { autocomplete, remove } from './playlist';

export default command(
  {
    desc: 'Removes your saved named playlist or track #n from that playlist',
    options: {
      name: {
        type: 'string',
        desc: 'The name of the playlist to remove, or remove from',
        autocomplete
      },
      n: {
        type: 'int',
        desc: 'The track number to remove',
        optional: true
      }
    }
  },
  async (i, { name, n }) => {
    await remove(i.user.id, name, n);
    await i.reply(
      typeof n === 'number'
        ? `Removed #${n} from playlist ${name}`
        : `Removed playlist ${name}`
    );
  }
);
