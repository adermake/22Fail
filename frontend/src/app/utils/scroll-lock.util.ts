/**
 * Reference-counted background scroll lock for fullscreen modals.
 *
 * Counted rather than a plain set/clear so that nested or overlapping modals cannot leave the
 * page permanently unscrollable: the lock is only released when the last holder unlocks.
 */
let locks = 0;

export function lockBodyScroll(): void {
  if (locks++ === 0) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
}

export function unlockBodyScroll(): void {
  if (locks === 0) return;
  if (--locks === 0) {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}
