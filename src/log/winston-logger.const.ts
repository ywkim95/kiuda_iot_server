import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const wlogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new DailyRotateFile({
      filename: './logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      // 자동으로 2주뒤에 삭제되는 로그
      // maxFiles: '14d',
    }),
  ],
});

export default wlogger;
