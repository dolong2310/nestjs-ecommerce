import { AuthConditionKey, AuthKey } from '@/shared/constants/auth.constant';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AuthenticationRequiredException } from '@/shared/errors/shared-error.error';
import { AUTH_TYPE_KEY, AuthMetadata, AuthType } from '@/shared/types/shared-auth.type';
import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthCompositeGuard implements CanActivate {
  private readonly guardMap: Record<AuthType, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly authGuard: AuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    // Map auth types to guards
    this.guardMap = {
      [AuthKey.JWT]: this.authGuard,
      [AuthKey.API_KEY]: this.apiKeyGuard,
      [AuthKey.NONE]: { canActivate: async () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this._getAuthMetadata(context);

    // No metadata = default to JWT auth (protect all routes by default)
    if (!metadata) {
      /**
       * Use _executeGuardsAnd to execute all guards, otherwise use to JWT auth by default
       */
      // const guardMap: Record<Exclude<AuthType, typeof AuthKey.NONE>, CanActivate> = {
      //   [AuthKey.JWT]: this.authGuard,
      //   [AuthKey.API_KEY]: this.apiKeyGuard,
      // };
      // return this._executeGuardsAnd(Object.values(guardMap), context);
      return this._executeGuard(this.authGuard, context);
    }

    const { types, options } = metadata;

    // Check if public route (no auth required)
    // Example: @Public() | @Private([AuthKey.NONE]) | @Private([])
    if (this._isPublicRoute(types)) {
      return true;
    }

    const guards = this._getGuardsToExecute(types);
    const condition = options?.condition || AuthConditionKey.AND;

    return this._executeGuardsByCondition(guards, context, condition);
  }

  private _getAuthMetadata(context: ExecutionContext): AuthMetadata | undefined {
    return this.reflector.get<AuthMetadata>(AUTH_TYPE_KEY, context.getHandler());
  }

  private _isPublicRoute(types: AuthType[]): boolean {
    return types.length === 0 || types.includes(AuthKey.NONE);
  }

  private _getGuardsToExecute(types: AuthType[]): CanActivate[] {
    return types.map((type) => this.guardMap[type]).filter(Boolean);
  }

  private async _executeGuardsByCondition(
    guards: CanActivate[],
    context: ExecutionContext,
    condition: (typeof AuthConditionKey)[keyof typeof AuthConditionKey],
  ): Promise<boolean> {
    if (guards.length === 0) {
      return true;
    }

    if (guards.length === 1) {
      return this._executeGuard(guards[0], context);
    }

    return condition === AuthConditionKey.AND
      ? this._executeGuardsAnd(guards, context)
      : this._executeGuardsOr(guards, context);
  }

  private async _executeGuard(guard: CanActivate, context: ExecutionContext): Promise<boolean> {
    const canActivate = await guard.canActivate(context);
    if (canActivate) {
      return true;
    }
    throw AuthenticationRequiredException;
  }

  private async _executeGuardsAnd(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    const errors: Error[] = [];

    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);
        if (!canActivate) {
          throw AuthenticationRequiredException;
        }
      } catch (error) {
        errors.push(error as Error);
      }
    }

    // If there are any errors, throw the first one to preserve original error
    if (errors.length > 0) {
      const firstError = errors[0];
      if (firstError instanceof HttpException) {
        throw firstError;
      }
      // If not HttpException, throw it anyway to preserve error information
      throw firstError;
    }

    return true;
  }

  private async _executeGuardsOr(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    const errors: Error[] = [];

    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);
        if (canActivate) {
          return true; // At least one guard passed
        }
      } catch (error) {
        errors.push(error as Error);
      }
    }

    // If all guards failed, throw the most relevant error
    if (errors.length > 0) {
      const lastError = errors[errors.length - 1];
      if (lastError instanceof HttpException) {
        throw lastError;
      }
      // If not HttpException, throw it anyway to preserve error information
      throw lastError;
    }

    // If no errors but all guards returned false, throw authentication required
    throw AuthenticationRequiredException;
  }
}
