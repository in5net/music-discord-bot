import { Client } from 'genius-lyrics';

import './env';

const client = new Client(process.env.GENIUS_TOKEN);

export async function getLyrics(query: string): Promise<string | undefined> {
  const [song] = await client.songs.search(query);
  const lyrics = await song?.lyrics();
  return lyrics;
}
