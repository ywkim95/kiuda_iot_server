import { BaseWithUpdateModel } from 'src/common/entity/base-with-update.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ContSpecModel } from './specifications-controller.entity';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

/**
 * 기본적으로 디지털이면 2개 생성, stepswitch면 기기가 지원하는 갯수만큼 생성하면되고..
 * 근데 slider는 어떻게 해줘야되지...
 * 단위 별로 나눠서 만들어줘야되나 일단 프론트에서 만들어서 보내주는게 맞는거같은데
 * 슬라이더는 그냥 스텝리스트 없이 가는걸로 대신 유저가 만든 증감에서 많이 만들어줘야할듯하다.
 */
@Entity()
export class ContSpecStepModel extends BaseWithUpdateModel {
  @ManyToOne(() => ContSpecModel, (spec) => spec.specificationSteps)
  specification: ContSpecModel;

  @Column({ comment: '값' })
  @IsNumber()
  value: number;

  @Column({ comment: '라벨' })
  @IsString()
  label: string;

  @Column({ comment: '사용 유무' })
  @IsBoolean()
  useYn: boolean;
}
