import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TimeUnitEnum } from './const/time-unit.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DevicesService } from '../devices/devices.service';
import { AbstractAverageModel } from './entities/average/abstract-average.entity';
import { DailyAverageModel } from './entities/average/daily-average.entity';
import { MonthlyAverageModel } from './entities/average/monthly-average.entity';

@Injectable()
export class RealTimeDataSaveService {
  constructor(
    @InjectRepository(SensorRealTimeDataModel)
    private readonly realtimeSensorsRepository: Repository<SensorRealTimeDataModel>,
    @InjectRepository(FiveMinutesAverageModel)
    private readonly fiveAverageRepository: Repository<FiveMinutesAverageModel>,
    @InjectRepository(DailyAverageModel)
    private readonly dailyAverageRepository: Repository<DailyAverageModel>,
    @InjectRepository(MonthlyAverageModel)
    private readonly monthlyAverageRepository: Repository<MonthlyAverageModel>,
    private readonly devicesService: DevicesService,
  ) {}

  // 테이블과 그래프

  async getTableAndGraph(
    deviceId: number,
    startDate: string,
    endDate: string,
    unit: TimeUnitEnum,
  ) {
    /**
     * 이건 누적 테이블을 만들어서 데이터를 보내줘야겠다.
     *
     * 계산 방식은 일(day) 기준으로 한다.
     */
    // yyyy-MM-ddTHH:mm:ssZ
    const sDate = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 5 * 60 * 1000);
    const eDate = endDate ? new Date(endDate) : new Date();

    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      throw new BadRequestException(
        'stateDate와 endDate에 올바른 날짜형식을 기입해주세요. -- yyyy-MM-ddTHH:mm:ssZ --',
      );
    }

    switch (unit) {
      case TimeUnitEnum.MINUTE:
        return await this.getSavedData(
          this.fiveAverageRepository,
          deviceId,
          sDate,
          eDate,
        );
      case TimeUnitEnum.DAILY:
        return await this.getSavedData(
          this.dailyAverageRepository,
          deviceId,
          sDate,
          eDate,
        );
      case TimeUnitEnum.MONTHLY:
        return await this.getSavedData(
          this.monthlyAverageRepository,
          deviceId,
          sDate,
          eDate,
        );
    }
  }

  async getSavedData<T extends AbstractAverageModel>(
    repository: Repository<T>,
    id: number,
    startDate: Date,
    endDate: Date,
  ): Promise<T[]> {
    const datas = await repository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.device', 'device')
      .where('device.id = :id', { id: id })
      .andWhere('model.startDate > :startDate', { startDate: startDate })
      .andWhere('model.endDate > :endDate', { endDate: endDate })
      .getMany();

    if (datas.length === 0) {
      throw new NotFoundException();
    }

    return datas;
  }

  // ------------ 데이터 저장 로직 --------------

  // 5분마다 누적데이터 저장로직
  @Cron(CronExpression.EVERY_5_MINUTES)
  async saveDataFiveMinutes() {
    /**
     * 1. 모든 iot센서들의 id를 가져와 id리스트를 만든다.
     * 2. id리스트를 기준으로 id별로 각각의 항목(s1~s20)의 5분동안의 데이터를 합치고 평균을 낸다.
     * 3. 모든 id리스트의 합치기 계산이 끝나면 5분간의 데이터의 수를 더해서 평균값과 함께 모델에 넣는다.
     * 4. 물론 5분간의 데이터 중 가장 첫번째 데이터의 저장일자와 마지막 저장일자를 측정 시작 시간, 측정 종료 시간에 넣는다.
     * 5. 각각의 평균데이터리스트들은 자신에 해당하는 device의 정보를 알기위해서 device의 id를 가지고있는다.
     */

    const sensorIds = await this.devicesService.getAllDeviceSensorIds();

    const averageModels = await Promise.all(
      sensorIds.map((id) => this.processSensorData(id, TimeUnitEnum.MINUTE)),
    );

    // averageModels를 저장하는 로직 필요
    await this.saveAverageModels(averageModels, this.fiveAverageRepository);
  }

  // 하루마다 누적데이터 저장로직
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async saveDataDaily() {
    const sensorIds = await this.devicesService.getAllDeviceSensorIds();

    const averageModels = await Promise.all(
      sensorIds.map((id) => this.processSensorData(id, TimeUnitEnum.DAILY)),
    );

    // averageModels를 저장하는 로직 필요
    await this.saveAverageModels(averageModels, this.dailyAverageRepository);
  }

  // 한달마다 누적데이터 저장로직
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async saveDataMonthly() {
    const sensorIds = await this.devicesService.getAllDeviceSensorIds();

    const averageModels = await Promise.all(
      sensorIds.map((id) => this.processSensorData(id, TimeUnitEnum.MONTHLY)),
    );

    // averageModels를 저장하는 로직 필요
    await this.saveAverageModels(averageModels, this.monthlyAverageRepository);
  }

  createAverageModel<T extends AbstractAverageModel>(type: TimeUnitEnum): T {
    switch (type) {
      case TimeUnitEnum.MINUTE:
        return new FiveMinutesAverageModel() as T;
      case TimeUnitEnum.DAILY:
        return new DailyAverageModel() as T;
      case TimeUnitEnum.MONTHLY:
        return new MonthlyAverageModel() as T;
      default:
        throw new TypeError();
    }
  }

  async processSensorData<T extends AbstractAverageModel>(
    sensorId: number,
    times: TimeUnitEnum,
  ): Promise<T> {
    const allSensorData = await this.getSensorData(sensorId);
    let averageModel: T = this.createAverageModel(times);

    averageModel.device = allSensorData[0]?.device;

    for (let i = 1; i <= 20; i++) {
      // 평균값 계산
      let sum = 0;
      let min = Number.MAX_VALUE;
      let max = Number.MIN_VALUE;
      let count = 0;

      for (const data of allSensorData) {
        const sensorValue = data[`s${i}`];
        if (sensorValue !== undefined) {
          sum += sensorValue;
          min = Math.min(min, sensorValue);
          max = Math.max(max, sensorValue);
          count++;
        }
      }

      const average = count > 0 ? sum / count : 0;
      averageModel[`s${i}`] = { min, max, average };
    }

    // 시작시간 종료시간 총 데이터 수
    averageModel.startDate = allSensorData[0].createdAt;
    averageModel.endDate = allSensorData[allSensorData.length - 1].createdAt;
    averageModel.dataCount = allSensorData.length;

    return averageModel;
  }

  private async getSensorData(
    sensorId: number,
  ): Promise<SensorRealTimeDataModel[]> {
    const fiveMinuteAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.realtimeSensorsRepository.find({
      where: {
        device: {
          id: sensorId,
        },
        createdAt: MoreThan(fiveMinuteAgo),
      },
      relations: {
        device: true,
      },
    });
  }
  private async saveAverageModels<T extends AbstractAverageModel>(
    averageModels: T[],
    repository: Repository<T>,
  ) {
    await Promise.all(averageModels.map((model) => repository.save(model)));
  }
}
