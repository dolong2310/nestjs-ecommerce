import { existsSync, mkdirSync, unlink, unlinkSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const isDirectoryExistsSync = (path: string) => {
  return existsSync(path); // && statSync(path).isDirectory();
};

export const createDirectorySync = (path: string) => {
  mkdirSync(path, { recursive: true });
};

export const deleteFileSync = (path: string) => {
  unlinkSync(path);
};

export const deleteFile = (path: string, callback?: (err: Error | null) => void) => {
  const defaultErrorCallback = (error: Error | null) => {
    if (error) throw new Error(error.message);
  };
  unlink(path, typeof callback === 'function' ? callback : defaultErrorCallback);
};

// Generate random upload filename
export const generateRandomFilename = (filename: string) => {
  const extension = path.extname(filename);
  return `${uuidv4()}${extension}`;
};
