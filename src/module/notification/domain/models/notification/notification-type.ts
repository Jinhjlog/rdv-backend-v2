import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

export const NotificationTypeError = {
  InvalidType: '유효하지 않은 알림 타입입니다.',
} as const;

export const NotificationTypeValue = {
  Meeting: 'MEETING',
  Character: 'CHARACTER',
  Attendance: 'ATTENDANCE',
  System: 'SYSTEM',
} as const;

export type NotificationTypeCode =
  (typeof NotificationTypeValue)[keyof typeof NotificationTypeValue];

interface NotificationTypeProps {
  value: NotificationTypeCode;
}

export class NotificationType extends ValueObject<NotificationTypeProps> {
  private static readonly VALID_TYPES = Object.values(NotificationTypeValue);

  private constructor(props: NotificationTypeProps) {
    super(props);
  }

  get value(): NotificationTypeCode {
    return this.props.value;
  }

  isMeeting(): boolean {
    return this.props.value === NotificationTypeValue.Meeting;
  }

  isCharacter(): boolean {
    return this.props.value === NotificationTypeValue.Character;
  }

  isAttendance(): boolean {
    return this.props.value === NotificationTypeValue.Attendance;
  }

  isSystem(): boolean {
    return this.props.value === NotificationTypeValue.System;
  }

  /**
   * 알림 타입을 생성합니다.
   *
   * @throws {ValueObjectValidationException} INVALID_NOTIFICATION_TYPE - 유효하지 않은 알림 타입입니다.
   */
  static create(type: string): NotificationType {
    const trimmedType = type.trim().toUpperCase();

    if (!this.isValidType(trimmedType)) {
      throw new ValueObjectValidationException({
        entityName: NotificationType.name,
        reason: NotificationTypeError.InvalidType,
        errorCode: 'INVALID_NOTIFICATION_TYPE',
      });
    }

    return new NotificationType({ value: trimmedType });
  }

  private static isValidType(type: string): type is NotificationTypeCode {
    return this.VALID_TYPES.includes(type as NotificationTypeCode);
  }

  /**
   * 검증 없이 타입을 생성합니다 (DB 복원용)
   */
  static unsafeCreate(type: string): NotificationType {
    return new NotificationType({
      value: type as NotificationTypeCode,
    });
  }
}
