import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: join(__dirname, '../../.env') });
config({ path: join(__dirname, '../.env') });

const localEnvPath = join(__dirname, '../.env.local');
if (process.env.NODE_ENV !== 'production' && existsSync(localEnvPath))
  config({ path: localEnvPath, override: true });
