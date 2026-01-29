import { DevicePlatform } from '../../domain/models';

export class RegisterDeviceTokenDto {
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceInfo?: string;
}
