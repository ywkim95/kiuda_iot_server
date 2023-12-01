import { ValidationPipe } from '@nestjs/common';

export const CustomValidationPipe = new ValidationPipe({
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  whitelist: true,
  forbidNonWhitelisted: true,
});
