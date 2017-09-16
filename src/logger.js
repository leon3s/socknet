import chalk from 'chalk';
import debug from 'debug';

export default (socket, event, ...args) => {
  const socknetDebug = debug('socknet');
  const [err, response] = args;
  const color = err ? chalk.red : chalk.green;
  const data = err || response;
  socknetDebug(`${color('SOCK')} ${event.config.route}\n`, data);
};
