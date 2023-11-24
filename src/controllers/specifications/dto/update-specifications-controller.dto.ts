import { PartialType } from '@nestjs/mapped-types';
import { CreateContSpecDto } from './create-specifications-controller.dto';

export class UpdateContSpecDto extends PartialType(CreateContSpecDto) {}
