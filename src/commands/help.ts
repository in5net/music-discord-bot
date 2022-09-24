import helpCommand from '$services/help.js';
import commands from './index.js';
import { color } from '$services/config.js';

const help = helpCommand('Thor Music', '-', color, commands);
export default help;
