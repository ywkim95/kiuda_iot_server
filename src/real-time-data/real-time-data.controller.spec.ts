import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeDataController } from './real-time-data.controller';
import { RealTimeDataService } from './real-time-data.service';
import { RealTimeDataSaveService } from './real-time-data-save.service';
import { LoRaEnum } from './const/lora-enum.const';
import { TimeUnitEnum } from './const/time-unit.enum';
import { BadRequestException } from '@nestjs/common';
import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
import { AccumulatedIrradianceModel } from './entities/accumulate/accumulated-irradiance.entity';

describe('RealTimeDataController', () => {
  let controller: RealTimeDataController;
  let realtimeService: RealTimeDataService;
  let saveService: RealTimeDataSaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealTimeDataController],
      providers: [
        {
          provide: RealTimeDataService,
          useValue: {
            // 여기에 필요한 메서드와 모의 반환값을 정의합니다.
            receiveData: jest.fn().mockResolvedValue({
              ghid: '082',
              glid: '031',
              gid: '100',
            }),
            joinDevice: jest.fn().mockResolvedValue({
              ghid: '082',
              glid: '031',
              gid: '100',
            }),
            getAlarmRangeAndCalibrateById: jest.fn(),
            updateAlarmRangeAndCalibrate: jest.fn(),
            getSensorListByControllerId: jest.fn(),
            getAccumulateData: jest.fn(),
            // .mockResolvedValue({
            //   id: 1,
            //   createdAt: new Date(),
            //   date: '2023-12-01',
            //   dataCount: 100,
            //   accumulatedIrradiance: 234589,
            //   deviceId: 1,
            // }),
          },
        },
        {
          provide: RealTimeDataSaveService,
          useValue: {
            // 여기에 필요한 메서드와 모의 반환값을 정의합니다.
            getTableAndGraph: jest.fn(),
            // .mockResolvedValue({
            //   tableAndGraph: Array(new FiveMinutesAverageModel()),
            //   irradiance: new AccumulatedIrradianceModel(),
            // }),
          },
        },
      ],
    }).compile();

    controller = module.get<RealTimeDataController>(RealTimeDataController);
    realtimeService = module.get<RealTimeDataService>(RealTimeDataService);
    saveService = module.get<RealTimeDataSaveService>(RealTimeDataSaveService);
  });

  // postLoRa 테스트
  describe('postLoRa', () => {
    it('should handle CONTROL case', async () => {
      // CONTROL 케이스에 대한 테스트 구현
      expect(await controller.postLoRa({ lora: 'c' }, LoRaEnum.CONTROL)).toBe(
        '제어',
      );
    });

    // it('should handle JOIN case', async () => {
    //   // JOIN 케이스에 대한 테스트 구현
    //   expect(await controller.postLoRa({ lora: 'j' }, LoRaEnum.JOIN)).toBe(
    //     `SV+ULD:${data.ghid},${data.glid},${data.gid},OK`,
    //   );
    // });

    // it('should handle UPDATE case', async () => {
    //   // UPDATE 케이스에 대한 테스트 구현
    //   expect(await controller.postLoRa({ lora: 'u' }, LoRaEnum.UPDATE)).toBe(
    //     `SV+ULD:${data.ghid},${data.glid},${data.gid},OK`,
    //   );
    // });

    it('should handle CUSTOM VALUE case', async () => {
      // CUSTOM VALUE 케이스에 대한 테스트 구현
      expect(await controller.postLoRa({ lora: 'cvr' }, LoRaEnum.CUSTOM)).toBe(
        '커스텀밸류임',
      );
    });

    // 나머지 케이스에 대한 테스트를 여기에 추가
  });

  // getTableAndGraph 테스트
  describe('getTableAndGraph', () => {
    it('should throw BadRequestException for invalid dates', async () => {
      const deviceId = 1;
      const timeUnit = TimeUnitEnum.MINUTE;
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '123';

      await expect(
        controller.getTableAndGraph(deviceId, timeUnit, startDate, endDate),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call saveService.getTableAndGraph with correct parameters', async () => {
      const deviceId = 1;
      const timeUnit = TimeUnitEnum.MINUTE;
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-02T00:00:00Z';

      await controller.getTableAndGraph(deviceId, timeUnit, startDate, endDate);

      expect(saveService.getTableAndGraph).toHaveBeenCalledWith(
        deviceId,
        startDate,
        endDate,
        timeUnit,
      );
    });
  });

  // 추가적인 메서드에 대한 테스트를 여기에 구현
});
