import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * Soft admin gate. Reads the caller's identity from the `x-user-id` / `x-user-code` headers the
 * frontend attaches, resolves it against the user store, and allows the request only if that user
 * is an admin. Applied ONLY to admin-only mutations (create/promote users, assign character
 * controllers, etc.) — everything else stays open, per the soft-enforcement decision.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = this.users.resolve(
      req.headers['x-user-id'] as string,
      req.headers['x-user-code'] as string,
    );
    if (!user?.isAdmin) throw new ForbiddenException('Admin only');
    return true;
  }
}
