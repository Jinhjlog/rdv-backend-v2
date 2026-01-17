/**
 * 회원가입 요청 DTO
 */
export class RegisterDto {
  deviceId: string;
  nickname: string;
  preferredThemeColor: string;
  characterCode?: string; // 선택사항
}
