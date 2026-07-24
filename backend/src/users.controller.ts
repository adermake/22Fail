import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException,
  Param, Patch, Post, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from './admin.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Whether the instance has any users yet — drives the "create first admin" screen. */
  @Get('status')
  status() {
    return { needsBootstrap: this.users.isEmpty() };
  }

  /** Create the first user as admin. Only works while no users exist. */
  @Post('bootstrap')
  bootstrap(@Body() body: { name: string }) {
    try {
      return this.users.bootstrapFirstAdmin(body?.name);
    } catch {
      throw new ForbiddenException('Users already exist');
    }
  }

  /** Log in with name + join code. Returns the user record (includes the code, id, isAdmin). */
  @Post('login')
  login(@Body() body: { name: string; code: string }) {
    const user = this.users.login(body?.name, body?.code);
    if (!user) throw new UnauthorizedException('Unknown name or code');
    return user;
  }

  /** Re-validate a stored device identity (id + code) → the live user, or 401 if stale. */
  @Post('resolve')
  resolve(@Body() body: { userId: string; code: string }) {
    const user = this.users.resolve(body?.userId, body?.code);
    if (!user) throw new UnauthorizedException('Identity no longer valid');
    return user;
  }

  // ── Admin-only management ──
  @Get()
  @UseGuards(AdminGuard)
  list() {
    return this.users.list();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: { name: string; isAdmin?: boolean }) {
    try {
      return this.users.create(body?.name, body?.isAdmin);
    } catch (e: any) {
      throw new BadRequestException(e?.message ?? 'Could not create user');
    }
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() body: { name?: string; isAdmin?: boolean; regenerateCode?: boolean }) {
    const updated = this.users.update(id, body ?? {});
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    if (!this.users.remove(id)) throw new NotFoundException('User not found');
    return { ok: true };
  }
}
