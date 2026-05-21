# Controller 작성 규칙

## 공개 API 컨트롤러

인증 불필요. GET 엔드포인트만 제공.

```typescript
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('공지사항')
@Controller({ path: 'notices', version: '1' })
export class NoticeController {
  constructor(
    private readonly findNoticeListUseCase: FindNoticeListUseCase,
    private readonly findNoticeDetailUseCase: FindNoticeDetailUseCase,
  ) {}

  // 목록 조회 (페이지네이션)
  @ApiOperation({
    summary: '공지사항 목록 조회',
    description:
      '공지사항 목록을 조회합니다.<br><br>' +
      '**검색 조건**<br>' +
      '- keyword: 제목 검색 (최대 300자)<br>' +
      '- categoryId: 카테고리별 필터링<br><br>' +
      '**페이지네이션**<br>' +
      '- page: 페이지 번호 (기본값 1)<br>' +
      '- limit: 페이지당 건수 (기본값 20, 최대 50)<br>',
  })
  @ApiOkResponse({ description: '목록 조회 성공', type: NoticeListResponseDto })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청<br>' +
      '- 검색 키워드가 너무 긴 경우 (최대 300자): _**KEYWORD_TOO_LONG**_<br>',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getNoticeList(
    @Query() dto: GetNoticeListRequestDto,
  ): Promise<NoticeListResponseDto> {
    const result = await this.findNoticeListUseCase.execute({
      limit: dto.limit ?? 20,
      page: dto.page ?? 1,
      keyword: dto.keyword,
      categoryId: dto.categoryId,
    });
    return NoticeTransformer.toListResponse(result);
  }

  // 상세 조회
  @ApiOperation({
    summary: '공지사항 상세 조회',
    description: '공지사항의 상세 정보를 조회합니다.<br>',
  })
  @ApiParam({
    name: 'noticeId',
    description: '공지사항 ID (ULID)',
    example: '01HXK3G5N7MZQR8BVWEY6JKFP4',
  })
  @ApiOkResponse({
    description: '상세 조회 성공',
    type: NoticeDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: '공지사항을 찾을 수 없음: _**NOTICE_NOT_FOUND**_',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':noticeId')
  async getNoticeDetail(
    @Param('noticeId') id: string,
  ): Promise<NoticeDetailResponseDto> {
    const detail = await this.findNoticeDetailUseCase.execute(id);
    return NoticeTransformer.toDetailResponse(detail);
  }
}
```

---

## 관리자 API 컨트롤러

> **인증/인가 방식은 프로젝트마다 다를 수 있습니다.**
> 구현 전 반드시 해당 프로젝트의 기존 인증 데코레이터, Guard, 사용자 정보 주입 방식을 파악한 후 동일하게 적용합니다.

클래스 레벨 `@AdminAuth()`. CRUD 전체 제공.

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAuth } from '../../../admin/presentation/decorators/admin-auth.decorator';
import { CurrentAdmin } from '../../../admin/presentation/decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from '../../../admin/presentation/guards';

@ApiTags('관리자 - 공지사항')
@AdminAuth()
@Controller({ path: 'admin/notices', version: '1' })
export class AdminNoticeController {
  constructor(
    private readonly findAdminNoticeListUseCase: FindAdminNoticeListUseCase,
    private readonly findAdminNoticeDetailUseCase: FindAdminNoticeDetailUseCase,
    private readonly createNoticeUseCase: CreateNoticeUseCase,
    private readonly updateNoticeUseCase: UpdateNoticeUseCase,
    private readonly deleteNoticeUseCase: DeleteNoticeUseCase,
  ) {}

  // GET — 목록 조회
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAdminNoticeList(
    @Query() dto: GetAdminNoticeListRequestDto,
  ): Promise<AdminNoticeListResponseDto> {
    const result = await this.findAdminNoticeListUseCase.execute({
      limit: dto.limit ?? 20,
      page: dto.page ?? 1,
      keyword: dto.keyword,
    });
    return AdminNoticeTransformer.toListResponse(result);
  }

  // GET — 상세 조회
  @HttpCode(HttpStatus.OK)
  @Get(':noticeId')
  async getAdminNoticeDetail(
    @Param('noticeId') id: string,
  ): Promise<AdminNoticeDetailResponseDto> {
    const detail = await this.findAdminNoticeDetailUseCase.execute(id);
    return AdminNoticeTransformer.toDetailResponse(detail);
  }

  // POST — 생성
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createNotice(
    @Body() dto: CreateNoticeRequestDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ): Promise<AdminNoticeDetailResponseDto> {
    const { id } = await this.createNoticeUseCase.execute({
      title: dto.title,
      content: dto.content,
      authorName: admin.name,
      authorId: admin.adminId,
    });
    const detail = await this.findAdminNoticeDetailUseCase.execute(id);
    return AdminNoticeTransformer.toDetailResponse(detail);
  }

  // PATCH — 수정
  @HttpCode(HttpStatus.OK)
  @Patch(':noticeId')
  async updateNotice(
    @Param('noticeId') id: string,
    @Body() dto: UpdateNoticeRequestDto,
  ): Promise<AdminNoticeDetailResponseDto> {
    await this.updateNoticeUseCase.execute({ id, ...dto });
    const detail = await this.findAdminNoticeDetailUseCase.execute(id);
    return AdminNoticeTransformer.toDetailResponse(detail);
  }

  // DELETE — 삭제 (Soft Delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':noticeId')
  async deleteNotice(@Param('noticeId') id: string): Promise<void> {
    await this.deleteNoticeUseCase.execute(id);
  }
}
```

---

## 규칙

| 항목            | 규칙                                                          |
| --------------- | ------------------------------------------------------------- |
| 공개 API 경로   | `/{entities}`                                                 |
| 관리자 API 경로 | `/admin/{entities}`                                           |
| 인증            | 공개: 없음 / 관리자: `@AdminAuth()` 클래스 레벨               |
| 관리자 정보     | `@CurrentAdmin() admin: AuthenticatedAdmin`                   |
| ID 파라미터     | `@Param('entityId') id: string` — ParseUUIDPipe 사용 금지     |
| 목록 조회       | `@Query() dto` 사용, 기본값 `limit ?? 20`, `page ?? 1`        |
| 응답 변환       | 반드시 Transformer 사용 — 인라인 맵핑 금지                    |
| HttpCode        | GET: OK, POST: CREATED, PATCH: OK, DELETE: NO_CONTENT         |
| Swagger         | 모든 엔드포인트에 `@ApiOperation` + 응답/에러 데코레이터 필수 |
| description     | 한국어, HTML `<br>` 줄바꿈, 에러코드 `_**ERROR_CODE**_` 형식  |
