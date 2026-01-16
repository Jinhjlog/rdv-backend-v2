/**
 * Unit of Work DI 토큰
 *
 * Symbol을 사용하여 타입 안전한 의존성 주입을 제공합니다.
 * 하드코딩된 문자열 대신 Symbol을 사용하여 충돌을 방지합니다.
 */
export const UNIT_OF_WORK = Symbol('IUnitOfWork');
