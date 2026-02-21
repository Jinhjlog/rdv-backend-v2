const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * Date를 한국어 알림용 포맷으로 변환
 *
 * @example formatKoreanDateTime(date) // "2/21(금) 14:00"
 */
export function formatKoreanDateTime(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAYS_KO[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month}/${day}(${dayOfWeek}) ${hours}:${minutes}`;
}
