import { INestApplication } from '@nestjs/common';
import { publicRequest, authRequest } from './api.helper';
import { AuthResponse, GroupDetailResponse, InviteCodeResponse } from './types';

export async function registerUser(
  app: INestApplication,
  deviceId: string,
  nickname = '테스터',
): Promise<string> {
  const res = await publicRequest(app).post('/api/v2/auth/register').send({
    deviceId,
    nickname,
    preferredThemeColor: '#FF0000',
  });
  expect(res.status).toBe(201);
  return (res.body as AuthResponse).accessToken;
}

export async function createGroup(
  app: INestApplication,
  token: string,
  name = '테스트모임',
): Promise<GroupDetailResponse> {
  const res = await authRequest(app, token).post('/api/v1/groups').send({
    name,
    description: '테스트용 모임',
    iconCode: 'icon_01',
  });
  expect(res.status).toBe(201);
  return res.body as GroupDetailResponse;
}

export async function createInviteCode(
  app: INestApplication,
  token: string,
  groupId: string,
): Promise<InviteCodeResponse> {
  const res = await authRequest(app, token).post(
    `/api/v1/groups/${groupId}/invite-codes`,
  );
  expect(res.status).toBe(201);
  return res.body as InviteCodeResponse;
}

export async function joinGroup(
  app: INestApplication,
  token: string,
  inviteCode: string,
): Promise<GroupDetailResponse> {
  const res = await authRequest(app, token)
    .post('/api/v1/groups/join')
    .send({ inviteCode });
  expect(res.status).toBe(201);
  return res.body as GroupDetailResponse;
}

export async function inviteAndJoin(
  app: INestApplication,
  ownerToken: string,
  memberToken: string,
  groupId: string,
): Promise<void> {
  const invite = await createInviteCode(app, ownerToken, groupId);
  await joinGroup(app, memberToken, invite.code);
}

export async function getUserId(
  app: INestApplication,
  token: string,
): Promise<string> {
  const res = await authRequest(app, token).get('/api/v1/users/me');
  return (res.body as { id: string }).id;
}

export function futureTime(minutesFromNow: number): string {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return date.toISOString();
}
