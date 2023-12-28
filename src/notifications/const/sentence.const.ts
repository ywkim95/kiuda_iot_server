export const sentence = (
  sensorName: string,
  warning: WarningEnum,
  sensorValue: number,
) =>
  `${sensorName}이(가) 현재 ${warning} 상태 입니다. 확인 바랍니다.\n현재 수치: ${sensorValue}`;

export enum WarningEnum {
  LOW = 'LowWarning',
  HIGH = 'HighWarning',
  DANGER = 'Danger',
}
