const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * UTC Date를 KST 기준 한국어 알림용 포맷으로 변환
 *
 * @example formatKoreanDateTime(date) // "2/21(금) 14:00"
 */
export function formatKoreanDateTime(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);

  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const dayOfWeek = DAYS_KO[kst.getUTCDay()];
  const hours = String(kst.getUTCHours()).padStart(2, '0');
  const minutes = String(kst.getUTCMinutes()).padStart(2, '0');

  return `${month}/${day}(${dayOfWeek}) ${hours}:${minutes}`;
}

/**
 * UTC Date를 KST 기준 M/D 형식으로 변환
 *
 * @example toKstDateString(date) // "2/21"
 */
export function toKstDateString(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kst.getUTCMonth() + 1}/${kst.getUTCDate()}`;
}
