import { LaunchpadSchema } from '@/shared/models/shared-launchpad.model';
import z from 'zod';

export type LaunchpadType = z.infer<typeof LaunchpadSchema>;
