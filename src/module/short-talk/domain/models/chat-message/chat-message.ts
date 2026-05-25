import { EntityClass, UniqueEntityId } from '@lib/domain';

export interface ChatMessageProps {
  id?: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

/**
 * 채팅 메시지 엔티티
 *
 * Short Talk에서 전송되는 개별 메시지를 나타냅니다.
 */
export class ChatMessage extends EntityClass<ChatMessageProps> {
  private static readonly MIN_CONTENT_LENGTH = 1;
  private static readonly MAX_CONTENT_LENGTH = 1000;
  private static readonly MAX_LINE_COUNT = 10;

  private constructor(props: ChatMessageProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * 메시지 내용 유효성 검증
   */
  static validateContent(content: string): {
    isValid: boolean;
    errorCode?: string;
    reason?: string;
  } {
    // 공백 제거 후 빈 메시지 확인
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return {
        isValid: false,
        errorCode: 'EMPTY_MESSAGE',
        reason: '메시지 내용을 입력해주세요',
      };
    }

    // 길이 검증
    if (content.length > ChatMessage.MAX_CONTENT_LENGTH) {
      return {
        isValid: false,
        errorCode: 'MESSAGE_TOO_LONG',
        reason: `메시지는 ${ChatMessage.MAX_CONTENT_LENGTH}자 이내로 입력해주세요`,
      };
    }

    // 줄바꿈 수 검증
    const lineCount = content.split('\n').length;
    if (lineCount > ChatMessage.MAX_LINE_COUNT) {
      return {
        isValid: false,
        errorCode: 'TOO_MANY_LINES',
        reason: `메시지는 ${ChatMessage.MAX_LINE_COUNT}줄 이내로 입력해주세요`,
      };
    }

    return { isValid: true };
  }

  /**
   * ChatMessage 생성 팩토리 메서드
   */
  static create(
    props: Pick<ChatMessageProps, 'groupId' | 'senderId' | 'content'>,
  ): ChatMessage {
    return new ChatMessage({
      ...props,
      createdAt: new Date(),
    });
  }

  /**
   * DB에서 복원할 때 사용하는 팩토리 메서드
   */
  static unsafeCreate(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props);
  }
}
