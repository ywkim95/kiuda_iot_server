import { HttpException, HttpStatus } from '@nestjs/common';

export class FirebaseNotifictionException extends HttpException {
  constructor(error: Error) {
    super(
      `Firebase Notification Error: ${error.message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
