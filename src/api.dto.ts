import { ApiProperty } from '@nestjs/swagger';

export class ApiDto {
  @ApiProperty({
    example: 'example Value',
    description: 'Description of example field',
  })
  exampleField: string;
}
