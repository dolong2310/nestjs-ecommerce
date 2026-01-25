import { UnauthorizedException } from "@nestjs/common";

export const InvalidApiKeyException = new UnauthorizedException([{
  field: 'xApiKey',
  message: 'Error.InvalidApiKey', // Invalid API key
}]);

export const AuthenticationRequiredException = new UnauthorizedException([{
  field: 'authentication',
  message: 'Error.AuthenticationRequired', // Authentication required
}]);

export const AccessTokenExpiredException = new UnauthorizedException([{
  field: 'accessToken',
  message: 'Error.AccessTokenExpired', // Access token has expired
}]);

export const InvalidAccessTokenException = new UnauthorizedException([{
  field: 'accessToken',
  message: 'Error.InvalidAccessToken', // Invalid access token
}]);
