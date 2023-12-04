export function isValidDate(dateStr: string): boolean {
  // ISO 8601 날짜 형식 (예: '2021-12-31T23:59:59Z')에 대한 정규 표현식
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

  // 정규 표현식을 사용하여 형식 검사
  if (!regex.test(dateStr)) {
    return false;
  }

  // Date 객체를 사용하여 날짜 유효성 검사
  const date = new Date(dateStr);
  // `Date` 객체가 유효한 날짜를 나타내는 경우, 'getTime()'은 NaN이 아닌 숫자를 반환합니다.
  return !isNaN(date.getTime());
}
