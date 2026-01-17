import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '@core/database/prisma.service';
import { UserInfo } from '../interfaces';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(id: string): Promise<UserInfo | null> {
    // TODO: 실제 DB 연동 로직 구현
    return Promise.resolve(null);

    // const user = await this.prisma.user.findUnique({
    //   where: { id },
    //   select: {
    //     id: true,
    //     nickname: true,
    //     nameTag: true,
    //   },
    // });
    // if (!user) {
    //   return null;
    // }
    // return {
    //   userId: user.id,
    //   nickname: user.nickname,
    //   nameTag: user.nameTag,
    // };
  }
}
