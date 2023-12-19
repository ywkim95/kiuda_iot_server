import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import wlogger from 'src/log/winston-logger.const';

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
    @Inject(forwardRef(() => DevicesService))
    private readonly devicesService: DevicesService,
  ) {}

  /**
   * 테이블과 그래프를 불러오기위한 누적데이터 저장이 필요함
   *
   */

  // 테이블과 그래프

  async getTableAndGraph(
    deviceId: number,
    startDate: string,
    endDate: string,
    unit: TimeUnitEnum,
  ): Promise<
    FiveMinutesAverageModel[] | DailyAverageModel[] | MonthlyAverageModel[]
  > {
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
      wlogger.error(
        'stateDate와 endDate에 올바른 날짜형식을 기입해주세요. -- yyyy-MM-ddTHH:mm:ssZ --',
      );
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
      .leftJoin('model.device', 'device')
      .where('device.id = :id', { id: id })
      .andWhere('model.startDate < :startDate', { startDate: startDate })
      .andWhere('model.endDate > :endDate', { endDate: endDate })
      .orderBy('model.id', 'ASC')
      .getMany();

    if (datas.length === 0) {
      wlogger.error(
        ` 해당 레포지토리에 매칭되는 데이터가 없습니다.\n id:${id}, repository: ${repository}\n 기간: ${startDate} ~ ${endDate}`,
      );
      throw new NotFoundException(
        `해당 레포지토리에 매칭되는 데이터가 없습니다.\n id:${id}, repository: ${repository}\n 기간: ${startDate} ~ ${endDate}`,
      );
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
    /**
     * 1. 모든 iot센서들의 id를 가져와 id리스트를 만든다.
     * 2. id리스트를 기준으로 id별로 각각의 항목(s1~s20)의 하루동안의 데이터를 합치고 평균을 낸다.
     * 3. 모든 id리스트의 합치기 계산이 끝나면 하루 데이터의 수를 더해서 평균값과 함께 모델에 넣는다.
     * 4. 물론 하루 데이터 중 가장 첫번째 데이터의 저장일자와 마지막 저장일자를 측정 시작 시간, 측정 종료 시간에 넣는다.
     * 5. 각각의 평균데이터리스트들은 자신에 해당하는 device의 정보를 알기위해서 device의 id를 가지고있는다.
     */

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
    /**
     * 1. 모든 iot센서들의 id를 가져와 id리스트를 만든다.
     * 2. id리스트를 기준으로 id별로 각각의 항목(s1~s20)의 한달동안의 데이터를 합치고 평균을 낸다.
     * 3. 모든 id리스트의 합치기 계산이 끝나면 한달 데이터의 수를 더해서 평균값과 함께 모델에 넣는다.
     * 4. 물론 한달 데이터 중 가장 첫번째 데이터의 저장일자와 마지막 저장일자를 측정 시작 시간, 측정 종료 시간에 넣는다.
     * 5. 각각의 평균데이터리스트들은 자신에 해당하는 device의 정보를 알기위해서 device의 id를 가지고있는다.
     */

    const sensorIds = await this.devicesService.getAllDeviceSensorIds();

    const averageModels = await Promise.all(
      sensorIds.map((id) => this.processSensorData(id, TimeUnitEnum.MONTHLY)),
    );

    // averageModels를 저장하는 로직 필요
    await this.saveAverageModels(averageModels, this.monthlyAverageRepository);
  }

  // 평균데이터 모델생성
  createAverageModel<T extends AbstractAverageModel>(type: TimeUnitEnum): T {
    try {
      switch (type) {
        case TimeUnitEnum.MINUTE:
          return new FiveMinutesAverageModel() as T;
        case TimeUnitEnum.DAILY:
          return new DailyAverageModel() as T;
        case TimeUnitEnum.MONTHLY:
          return new MonthlyAverageModel() as T;
        default:
          wlogger.error('정확한 타입을 지정해주세요.');
          throw new TypeError('정확한 타입을 지정해주세요.');
      }
    } catch (error) {
      wlogger.error(error);
      console.log(error);
    }
  }

  // 모델 별 최소, 최대, 평균, 데이터 수 계산
  async processSensorData<T extends AbstractAverageModel>(
    deviceId: number,
    times: TimeUnitEnum,
  ): Promise<T> {
    try {
      console.log(deviceId);
      const allSensorData = await this.getSensorDataList(deviceId);
      let averageModel: T = this.createAverageModel(times);

      console.log(allSensorData);
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
        if (min === Number.MAX_VALUE) {
          min = 0;
        }
        if (max === Number.MIN_VALUE) {
          max = 0;
        }

        const average = count > 0 ? sum / count : 0;
        if (min !== 0 || max !== 0 || average !== 0) {
          averageModel[`s${i}`] = { min, max, average };
        }
      }

      // 시작시간 종료시간 총 데이터 수
      if (times === TimeUnitEnum.MINUTE) {
        averageModel.startDate =
          allSensorData[0]?.createdAt ?? new Date(Date.now() - 5 * 60 * 1000);
      } else if (times === TimeUnitEnum.DAILY) {
        averageModel.startDate =
          allSensorData[0]?.createdAt ??
          new Date(Date.now() - 24 * 60 * 60 * 1000);
      } else if (times === TimeUnitEnum.MONTHLY) {
        averageModel.startDate =
          allSensorData[0]?.createdAt ??
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      averageModel.endDate =
        allSensorData[allSensorData.length - 1]?.createdAt ?? new Date();
      averageModel.dataCount = allSensorData.length;
      averageModel.createdAt = new Date();

      return averageModel;
    } catch (error) {
      wlogger.error(error);
      console.log(error);
    }
  }

  // 실시간 센서 데이터 가져오기
  private async getSensorDataList(
    id: number,
  ): Promise<SensorRealTimeDataModel[]> {
    const fiveMinuteAgo = new Date(Date.now() - 5 * 60 * 1000);
    console.log(new Date());
    console.log(fiveMinuteAgo);
    const dataList = await this.realtimeSensorsRepository.find({
      where: {
        device: { id },
        createdAt: MoreThan(fiveMinuteAgo),
      },
      relations: {
        device: true,
      },
    });
    console.log(dataList);
    return dataList;
  }
  //

  // 평균데이터 저장
  private async saveAverageModels<T extends AbstractAverageModel>(
    averageModels: T[],
    repository: Repository<T>,
  ) {
    const dataList = averageModels.map((model) => repository.save(model));
    await Promise.all(dataList);
  }
}
