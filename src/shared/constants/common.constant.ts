import path from 'path';

export const UPLOAD_DIR = path.resolve('upload');
export const EMAIL_TEMPLATES_DIR = path.resolve('src/shared/email-templates');
export const ALL_LANGUAGE_CODE = 'all';

export const EnumOrderBy = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const EnumSortBy = {
  CREATED_AT: 'createdAt', // MỚI NHẤT => sort theo ngày tạo
  SALES: 'sales', // BÁN CHẠY => sort theo tổng lượt mua (không tính theo tổng lượt mua mỗi tháng)
  PRICE: 'price', // GIÁ => sort theo giá (từ thấp đến cao - từ cao đến thấp) dựa vào OrderBy
} as const;

export type OrderByType = (typeof EnumOrderBy)[keyof typeof EnumOrderBy];
export type SortByType = (typeof EnumSortBy)[keyof typeof EnumSortBy];
