import { LaunchpadRepository } from '@/routes/launchpad/launchpad.repo';
import { EXPIRE_LAUNCHPAD_JOB_NAME, LAUNCHPAD_QUEUE_NAME } from '@/shared/constants/launchpad.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class LaunchpadExpireCronjob {
  private readonly logger = new Logger(LaunchpadExpireCronjob.name);

  constructor(
    private readonly launchpadRepo: LaunchpadRepository,
    @InjectQueue(LAUNCHPAD_QUEUE_NAME) private readonly launchpadQueue: Queue,
  ) {}

  /**
   * Chạy mỗi 2 phút để detect launchpads đã hết endTime nhưng vẫn còn status LIVE.
   * Chỉ detect và enqueue job, không xử lý trực tiếp (SRP).
   * BullMQ jobId = "expire-{id}" để dedup nếu cron chạy lại trước khi job cũ hoàn thành.
   */
  @Cron('*/2 * * * *')
  async detectExpiredLaunchpads(): Promise<void> {
    const expired = await this.launchpadRepo.findExpiredLive();

    if (expired.length === 0) return;

    this.logger.log(`Found ${expired.length} expired launchpad(s), enqueuing jobs...`);

    await this.launchpadQueue.addBulk(
      expired.map(({ id }) => ({
        name: EXPIRE_LAUNCHPAD_JOB_NAME,
        data: { launchpadId: id },
        opts: {
          jobId: `expire-${id}`, // Deduplication key
          attempts: 5,
          backoff: { type: 'exponential' as const, delay: 3000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        },
      })),
    );
  }
}
