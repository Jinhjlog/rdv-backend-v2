import { Module } from '@nestjs/common';
import { ProfanityFilterService } from './profanity-filter.service';
import { KoreanProfanityFilterService } from './korean-profanity-filter.service';

@Module({
  providers: [
    {
      provide: ProfanityFilterService,
      useClass: KoreanProfanityFilterService,
    },
  ],
  exports: [ProfanityFilterService],
})
export class ProfanityModule {}
