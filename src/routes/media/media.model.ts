import z from 'zod';

export const PresignedUrlUploadFileBodySchema = z
  .object({
    filename: z.string(),
    fileSize: z.number().max(1024 * 1024 * 5), // 5MB
  })
  .strict();

// export const UploadFileResponseSchema = z.object({
//   data: z.array(
//     z.object({
//       url: z.string(),
//     }),
//   ),
// });

export const UploadFileResponseSchema = z.array(
  z.object({
    url: z.string(),
  }),
);

export const PresignedUrlUploadFileResponseSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
});
