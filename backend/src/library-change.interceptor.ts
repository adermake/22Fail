import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { WorldGateway } from './world.gateway';

/**
 * Tells every connected client that a library changed, after any write to it.
 *
 * The asset browser has sixteen write endpoints (files, folders, bulk operations, the library
 * itself). Announcing the change in each one is sixteen places to forget, so it happens here:
 * anything that is not a GET and carries a `libraryId` broadcasts once it succeeded. A failed
 * request emits nothing, because `tap` only runs on the success path.
 */
@Injectable()
export class LibraryChangeInterceptor implements NestInterceptor {
  constructor(private readonly worldGateway: WorldGateway) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method === 'GET') return next.handle();

    return next.handle().pipe(
      tap((result: unknown) => {
        const libraryId =
          (req.params as Record<string, string> | undefined)?.['libraryId'] ??
          (result as { id?: string } | null)?.id;
        if (libraryId) this.worldGateway.broadcastLibraryChanged(libraryId);
      }),
    );
  }
}
