export const EnumLaunchpadStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  LIVE: 'LIVE',
  ENDED: 'ENDED',
  REJECTED: 'REJECTED',
} as const;

export type LaunchpadStatusType = (typeof EnumLaunchpadStatus)[keyof typeof EnumLaunchpadStatus];

export const LAUNCHPAD_QUEUE_NAME = 'launchpad';
export const EXPIRE_LAUNCHPAD_JOB_NAME = 'expire-launchpad';
