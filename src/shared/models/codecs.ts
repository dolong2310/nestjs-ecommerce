import { z } from 'zod';

export const stringToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

export const timestampToDate = z.codec(z.int().min(0), z.date(), {
  decode: (ms) => new Date(ms),
  encode: (date) => date.getTime(),
});
