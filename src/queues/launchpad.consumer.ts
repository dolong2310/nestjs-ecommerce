import { ManageLaunchpadService } from '@/routes/launchpad/manage-launchpad.service';
import { EXPIRE_LAUNCHPAD_JOB_NAME, LAUNCHPAD_QUEUE_NAME } from '@/shared/constants/launchpad.constant';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor(LAUNCHPAD_QUEUE_NAME)
export class LaunchpadConsumer extends WorkerHost {
  private readonly logger = new Logger(LaunchpadConsumer.name);

  constructor(private readonly manageLaunchpadService: ManageLaunchpadService) {
    super();
  }

  async process(job: Job<{ launchpadId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case EXPIRE_LAUNCHPAD_JOB_NAME: {
        const { launchpadId } = job.data;
        this.logger.log(`Processing expired launchpad: ${launchpadId}`);
        await this.manageLaunchpadService.processExpired(launchpadId);
        this.logger.log(`Finished processing expired launchpad: ${launchpadId}`);
        return {};
      }
      default:
        break;
    }
  }
}
