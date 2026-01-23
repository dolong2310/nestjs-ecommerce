import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType, AUTH_TYPE_KEY, AuthMetadata } from '@/shared/types/shared-auth.type';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AuthConditionKey, AuthKey } from '@/shared/constants/auth.constant';

@Injectable()
export class AuthCompositeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authGuard: AuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get metadata from decorator
    const metadata = this.reflector.get<AuthMetadata>(
      AUTH_TYPE_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return true; // No auth required
    }

    const { types, options } = metadata;
    const condition = options?.condition || AuthConditionKey.AND;

    // Map auth types to guards
    const guardMap: Record<AuthType, CanActivate> = {
      [AuthKey.JWT]: this.authGuard,
      [AuthKey.API_KEY]: this.apiKeyGuard,
    };

    // Get guards to execute
    const guards = types.map(type => guardMap[type]).filter(Boolean);

    if (guards.length === 0) {
      return true;
    }

    if (guards.length === 1) {
      return this._executeGuard(guards[0], context);
    }

    // Execute guards based on condition
    if (condition === AuthConditionKey.AND) {
      return this._executeGuardsAnd(guards, context);
    } else {
      return this._executeGuardsOr(guards, context);
    }
  }

  private async _executeGuard(guard: CanActivate, context: ExecutionContext): Promise<boolean> {
    try {
      const result = await guard.canActivate(context);
      if (result) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async _executeGuardsAnd(
    guards: CanActivate[],
    context: ExecutionContext,
  ): Promise<boolean> {
    const errors: any[] = [];

    for (const guard of guards) {
      try {
        const result = await guard.canActivate(context);
        if (!result) {
          throw new UnauthorizedException('Authentication failed');
        }
      } catch (error) {
        errors.push(error);
      }
    }

    // If there are any errors, throw the first one
    if (errors.length > 0) {
      throw errors[0];
    }

    return true;
  }

  private async _executeGuardsOr(
    guards: CanActivate[],
    context: ExecutionContext,
  ): Promise<boolean> {
    const errors: any[] = [];

    for (const guard of guards) {
      try {
        const result = await guard.canActivate(context);
        if (result) {
          return true; // At least one guard passed
        }
      } catch (error) {
        errors.push(error);
      }
    }

    // All guards failed, throw combined error
    throw new UnauthorizedException([{
      field: 'authentication',
      message: 'All authentication methods failed',
    }]);
  }
}
