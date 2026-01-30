import { Request } from 'express';

// Extract token from header
export function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

// Extract API key from header
export function extractApiKeyFromHeader(request: Request): string | string[] | undefined {
  return request.headers['x-api-key'];
}
