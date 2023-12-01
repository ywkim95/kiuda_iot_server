import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class KiudaLoggerService implements LoggerService {
  private logDirectory = 'logs';
  private getLogFileName() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}`;
    return `app-${dateStr}.log`;
  }

  private writeToFile(message: string) {
    const logFilePath = path.join(this.logDirectory, this.getLogFileName());
    fs.appendFileSync(logFilePath, message + '\n');
  }

  // private logFilePath = path.join(this.logDirectory, 'app.log');

  constructor() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory);
    }
  }

  log(message: string) {
    this.writeToFile(`[LOG] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string, trace: string) {
    this.writeToFile(
      `[ERROR] ${new Date().toISOString()} - ${message} - ${trace}`,
    );
  }

  warn(message: string) {
    this.writeToFile(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  // ... (debug, verbose 등 나머지 메소드 구현)
}
