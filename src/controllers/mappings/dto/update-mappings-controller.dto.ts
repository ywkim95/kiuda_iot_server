import { PartialType } from '@nestjs/mapped-types';
import { CreateContMapDto } from './create-mappings-controller.dto';

export class UpdateContMapDto extends PartialType(CreateContMapDto) {}
