// import { Test, TestingModule } from '@nestjs/testing';
// import { FiveMinutesAverageModel } from './entities/average/five-minutes-average.entity';
// import { DevicesService } from '../devices/devices.service';
// import { SensorRealTimeDataModel } from './entities/real-time/real-time-sensor.entity';
// import { DevicesModel } from '../devices/entities/device.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { ContRealTimeDataModel } from './entities/real-time/real-time-controller.entity';
// import { RealTimeDataSaveService } from './real-time-data-save.service';

// describe('RealTimeDataSaveService', () => {
//   let service: RealTimeDataSaveService;
//   const mockSensorData: SensorRealTimeDataModel[] = [
//     {
//       s1: 101,
//       s2: 102,
//       s3: 103,
//       s4: 104,
//       s5: 105,
//       s6: 106,
//       s7: 107,
//       s8: 108,
//       s9: 109,
//       s10: 110,
//       s11: 111,
//       s12: 112,
//       s13: 113,
//       s14: 114,
//       s15: 115,
//       s16: 116,
//       s17: 117,
//       s18: 118,
//       s19: 119,
//       s20: 120,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 1,
//       rssi: -100,
//       sqn: 20,
//     },
//     {
//       s1: 1,
//       s2: 2,
//       s3: 3,
//       s4: 4,
//       s5: 5,
//       s6: 6,
//       s7: 7,
//       s8: 8,
//       s9: 9,
//       s10: 10,
//       s11: 11,
//       s12: 12,
//       s13: 13,
//       s14: 14,
//       s15: 15,
//       s16: 16,
//       s17: 17,
//       s18: 18,
//       s19: 19,
//       s20: 20,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 2,
//       rssi: -100,
//       sqn: 20,
//     },
//     {
//       s1: 11,
//       s2: 21,
//       s3: 31,
//       s4: 41,
//       s5: 51,
//       s6: 61,
//       s7: 71,
//       s8: 81,
//       s9: 91,
//       s10: 101,
//       s11: 111,
//       s12: 121,
//       s13: 131,
//       s14: 141,
//       s15: 151,
//       s16: 161,
//       s17: 171,
//       s18: 181,
//       s19: 191,
//       s20: 201,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 3,
//       rssi: -100,
//       sqn: 20,
//     },
//     {
//       s1: 12,
//       s2: 22,
//       s3: 32,
//       s4: 42,
//       s5: 52,
//       s6: 62,
//       s7: 72,
//       s8: 82,
//       s9: 92,
//       s10: 102,
//       s11: 112,
//       s12: 122,
//       s13: 132,
//       s14: 142,
//       s15: 152,
//       s16: 162,
//       s17: 172,
//       s18: 182,
//       s19: 192,
//       s20: 202,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 4,
//       rssi: -100,
//       sqn: 20,
//     },
//     {
//       s1: 13,
//       s2: 23,
//       s3: 33,
//       s4: 43,
//       s5: 53,
//       s6: 63,
//       s7: 73,
//       s8: 83,
//       s9: 93,
//       s10: 103,
//       s11: 113,
//       s12: 123,
//       s13: 133,
//       s14: 143,
//       s15: 153,
//       s16: 163,
//       s17: 173,
//       s18: 183,
//       s19: 193,
//       s20: 203,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 5,
//       rssi: -100,
//       sqn: 20,
//     },
//     {
//       s1: 15,
//       s2: 25,
//       s3: 35,
//       s4: 45,
//       s5: 55,
//       s6: 65,
//       s7: 75,
//       s8: 85,
//       s9: 95,
//       s10: 105,
//       s11: 115,
//       s12: 125,
//       s13: 135,
//       s14: 145,
//       s15: 155,
//       s16: 165,
//       s17: 175,
//       s18: 185,
//       s19: 195,
//       s20: 205,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 6,
//       rssi: -100,
//       sqn: 20,
//     },
//     {
//       s1: 19,
//       s2: 29,
//       s3: 39,
//       s4: 49,
//       s5: 59,
//       s6: 69,
//       s7: 79,
//       s8: 89,
//       s9: 99,
//       s10: 109,
//       s11: 119,
//       s12: 129,
//       s13: 139,
//       s14: 149,
//       s15: 159,
//       s16: 169,
//       s17: 179,
//       s18: 189,
//       s19: 199,
//       s20: 209,
//       createdAt: new Date(),
//       device: new DevicesModel(),
//       id: 7,
//       rssi: -100,
//       sqn: 20,
//     },
//   ];
//   const mockSensorIds = [1, 2, 3, 4, 5, 6, 7];
//   const mockSaveFunction = jest.fn();

//   const mockDevicesService = {
//     getAllDeviceSensorIds: jest.fn().mockResolvedValue(mockSensorIds),
//   };

//   const mockRealtimeSensorsRepository = {
//     find: jest.fn().mockResolvedValue(mockSensorData),
//   };

//   const mockRealtimeContRepository: ContRealTimeDataModel = {
//     device: new DevicesModel(),
//     createdAt: new Date(),
//     id: 1,
//     rssi: -100,
//     sqn: 20,
//     gpio1: '0',
//     gpio2: '1',
//   };

//   const mockFiveAverageRepository = {
//     save: mockSaveFunction,
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         RealTimeDataSaveService,
//         { provide: DevicesService, useValue: mockDevicesService },
//         {
//           provide: getRepositoryToken(SensorRealTimeDataModel),
//           useValue: mockRealtimeSensorsRepository,
//         },
//         {
//           provide: getRepositoryToken(FiveMinutesAverageModel),
//           useValue: mockFiveAverageRepository,
//         },
//         {
//           provide: getRepositoryToken(ContRealTimeDataModel),
//           useValue: mockRealtimeContRepository,
//         },
//       ],
//     }).compile();

//     service = module.get<RealTimeDataSaveService>(RealTimeDataSaveService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('processSensorData', () => {
//     it('should correctly process sensor data', async () => {
//       const sensorId = 2;
//       const result = await service.processSensorData(sensorId);

//       expect(result).toBeInstanceOf(FiveMinutesAverageModel);
//       // expect(result.device.id).toEqual(sensorId);
//       expect(result.s1).toBeDefined();
//       expect(result.s10).toBeDefined();
//       expect(result.s20).toBeDefined();
//       expect(result.startDate).toBeDefined();
//       expect(result.endDate).toBeDefined();
//       expect(result.dataCount).toBeDefined();
//     });
//   });

//   describe('saveDataFiveMinutes', () => {
//     it('should process and save data correctly', async () => {
//       await service.saveDataFiveMinutes();

//       expect(mockDevicesService.getAllDeviceSensorIds).toHaveBeenCalled();
//       expect(mockRealtimeSensorsRepository.find).toHaveBeenCalled();
//       expect(mockSaveFunction).toHaveBeenCalled();
//       expect(mockFiveAverageRepository.save).toHaveBeenCalledTimes(
//         mockSensorIds.length,
//       );
//     });
//   });
// });
