import { shuffle } from '@limitlesspc/limitless';

import command from '$services/command';
import woof from '$services/woof';
import { getPlayer } from '../../players';
import { autocomplete, get } from './playlist';
import type { MediaType } from '../../media/media';

export default command(
  {
    desc: 'Loads your named playlist into the queue',
    options: {
      names: {
        type: 'string',
        desc: 'The names of the playlists to load into the queue',
        autocomplete
      },
      shuffle: {
        type: 'bool',
        desc: 'Whether to shuffle the playlists before loading them'
      }
    }
  },
  async (i, { names, shuffle: doShuffle }) => {
    const { guild, member } = i;
    if (!guild || !member) return;
    const player = getPlayer(guild.id);
    const guildMember = await guild.members.cache.get(member.user.id);

    const channel = guildMember?.voice.channel;
    if (!channel) return i.reply(`${woof()}, you are not in a voice channel`);

    player.setChannels(i);
    let allMedias: MediaType[] = [];
    const cache = new Map<string, MediaType[]>();
    for (const name of names) {
      let medias = cache.get(name);
      if (!medias) {
        medias = await get(i.user, name).catch(() => []);
      }
      allMedias.push(...medias);
    }

    if (doShuffle) allMedias = shuffle(allMedias);
    player.queue.enqueue(...allMedias);
    return player.play();
  }
);
