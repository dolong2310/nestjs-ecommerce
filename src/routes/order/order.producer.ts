import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constant';
import { generateCancelPaymentJobId } from '@/shared/helpers';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private readonly paymentQueue: Queue) {
    // this.paymentQueue.getJob(generateCancelPaymentJobId(123)).then((job) => {
    //   console.log('job: ', job);
    // });
  }

  async addJobCancelPayment(paymentId: number) {
    await this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      { paymentId },
      /**
       * Các props có thể xài ở đây khi thêm job vào BullMQ queue:
       *
       * - jobId: (string | number) Định danh duy nhất cho job này trong queue. Giúp tránh tạo trùng job, có thể dùng để update/truy xuất trạng thái job.
       * - delay: (number) Độ trễ (ms) trước khi job bắt đầu thực thi. VD: delay: 5000 sẽ đợi 5s mới run job.
       * - attempts: (number) Số lần thử tối đa nếu job fail (bao gồm lần đầu). Mặc định là 1 (chỉ chạy 1 lần, ko retry).
       * - backoff: (object | number | string) Cấu hình thời gian chờ giữa các lần retry:
       *    + { type: 'fixed', delay: n } – mỗi lần thử lại sẽ chờ đúng n ms.
       *    + { type: 'exponential', delay: n } – thời gian đợi tăng theo cấp số nhân (n, 2n, 4n,...).
       *    + n (number) – tương đương fixed delay n ms.
       * - removeOnComplete: (boolean | number) Khi job hoàn thành thì tự xoá khỏi queue (true) hoặc giữ lại N job thành công gần nhất (number).
       * - removeOnFail: (boolean | number) Khi job fail thì tự xoá job (true) hoặc giữ lại N job fail gần nhất (number).
       * - priority: (number) Độ ưu tiên, số nhỏ hơn thì ưu tiên cao hơn. Mặc định là 0.
       * - lifo: (boolean) FIFO hoặc LIFO (true: vào cuối hàng đợi chạy trước).
       * - timeout: (number) Đơn vị ms, thời gian tối đa để job hoàn thành, quá thời gian này thì fail.
       * - repeat: (object) Cấu hình lặp lại job (cron, mỗi x giây, v.v).
       * - attemptsMade: (number) Chỉ định số lần đã thử (ít khi dùng).
       * - stackTraceLimit: (number) Giữ lại tối đa N stacktrace (debug).
       * - timestamp: (number) Đánh dấu thời gian tạo job.
       * - dependencies: (array) Chạy khi đủ các job phụ thuộc.
       *
       * Ví dụ config phổ biến:
       */
      {
        delay: 1000 * 60 * 60 * 24, // 24 hours
        jobId: generateCancelPaymentJobId(paymentId),
        removeOnComplete: true,
        removeOnFail: true,
        // attempts: 3, // 3 lần thử tối đa (bao gồm lần đầu)
        // backoff: {
        //   type: 'exponential',
        //   delay: 1000, // lần retry đầu đợi 1s, các lần sau đợi lâu hơn (2s, 4s, ...)
        // },
        // priority: 1, // Độ ưu tiên, số nhỏ hơn = ưu tiên cao hơn (vd: priority: 1 > priority: 5)
        // timeout: 10000, // timeout job sau 10s
        // repeat: { cron: '0 * * * *' }, // chạy job mỗi đầu giờ (tham khảo thêm tài liệu BullMQ)
      },
    );
  }
}
