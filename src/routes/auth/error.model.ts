import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";

export const InvalidOtpCodeException = new BadRequestException([{
  field: 'code',
  message: 'Error.InvalidOtpCode', // Invalid OTP code
}]);

export const ExpiredOtpCodeException = new BadRequestException([{
  field: 'code',
  message: 'Error.ExpiredOtpCode', // OTP code has expired
}]);

export const EmailAlreadyExistsException = new BadRequestException([{
  field: 'email',
  message: 'Error.EmailAlreadyExists', // Email already exists
}]);

export const EmailNotFoundException = new NotFoundException([{
  field: 'email',
  message: 'Error.EmailNotFound', // Email not found
}]);

export const InvalidPasswordException = new BadRequestException([{
  field: 'password',
  message: 'Error.InvalidPassword', // Invalid password
}]);

export const FailedToCreateDeviceException = new BadRequestException([{
  field: 'device',
  message: 'Error.FailedToCreateDevice', // Failed to create device
}]);

export const RoleNotFoundException = new NotFoundException([{
  field: 'role',
  message: 'Error.RoleNotFound', // Role not found
}]);

export const RefreshTokenNotFoundException = new NotFoundException([{
  field: 'refreshToken',
  message: 'Error.RefreshTokenNotFound', // Refresh token not found
}]);

export const RefreshTokenExpiredException = new UnauthorizedException([{
  field: 'refreshToken',
  message: 'Error.RefreshTokenExpired', // Refresh token has expired
}]);

export const InvalidRefreshTokenException = new UnauthorizedException([{
  field: 'refreshToken',
  message: 'Error.InvalidRefreshToken', // Invalid refresh token
}]);

export const RefreshTokenHasBeenRevokedException = new UnauthorizedException([{
  field: 'refreshToken',
  message: 'Error.RefreshTokenHasBeenRevoked', // Refresh token has been revoked
}]);

export const UserNotFoundException = new NotFoundException([{
  field: 'userId',
  message: 'Error.UserNotFound', // User not found
}]);

export const FailedToSendOtpCodeException = new BadRequestException([{
  field: 'code',
  message: 'Error.FailedToSendOtpCode', // Failed to send OTP code
}]);

// Google Service
export const EmailNotVerifiedException = new UnauthorizedException([{
  field: 'email',
  message: 'Error.EmailNotVerified', // Email not verified
}]);
