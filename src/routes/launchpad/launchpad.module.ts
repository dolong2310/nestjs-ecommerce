import { LaunchpadExpireCronjob } from '@/cronjobs/launchpad-expire.cronjob';
import { LaunchpadController } from '@/routes/launchpad/launchpad.controller';
import { LaunchpadRepository } from '@/routes/launchpad/launchpad.repo';
import { LaunchpadService } from '@/routes/launchpad/launchpad.service';
import { ManageLaunchpadController } from '@/routes/launchpad/manage-launchpad.controller';
import { ManageLaunchpadService } from '@/routes/launchpad/manage-launchpad.service';
import { LAUNCHPAD_QUEUE_NAME } from '@/shared/constants/launchpad.constant';
import { LaunchpadConsumer } from '@/queues/launchpad.consumer';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: LAUNCHPAD_QUEUE_NAME,
    }),
  ],
  controllers: [LaunchpadController, ManageLaunchpadController],
  providers: [LaunchpadRepository, LaunchpadService, ManageLaunchpadService, LaunchpadConsumer, LaunchpadExpireCronjob],
  exports: [LaunchpadService, LaunchpadRepository],
})
export class LaunchpadModule {}
