import { ProfileController } from '@/routes/profile/profile.controller';
import { ProfileService } from '@/routes/profile/profile.service';
import { Module } from '@nestjs/common';

@Module({
  // imports: [SharedModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule { }
