import logger from './config/index';

const log = {
  info: (msg: string) => logger.info(msg),
  debug: (msg: string) => logger.debug(msg),
  warn: (msg: string) => logger.warn(msg),
  error: (err: string | Error) => {
    if (err instanceof Error) {
      logger.error(err.stack || err.message);
    } else {
      logger.error(err);
    }
  },
};

export default log;
