export const EnumMediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const;

export type MediaTypeType = (typeof EnumMediaType)[keyof typeof EnumMediaType];
