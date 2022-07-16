import helpCommand from '$services/help';
// eslint-disable-next-line import/no-cycle
import commands from './index';
import { color } from '$services/config';

const help = helpCommand('Thor Music', '-', color, commands);
export default help;
