import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RulebookService } from './rulebook.service';
import type { RulebookHeading, RulebookPage, RulebookSearchHit } from './rulebook.model';

interface HistoryEntry {
  pageId: string;
  scrollTop: number;
}

@Component({
  selector: 'app-rulebook',
  standalone: true,
  templateUrl: './rulebook.component.html',
  styleUrl: './rulebook.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // [innerHTML] content receives no _ngcontent attributes, so emulated encapsulation
  // cannot style it. Every selector in the stylesheet is `rb-`-prefixed to contain this.
  encapsulation: ViewEncapsulation.None,
})
export class RulebookComponent implements OnInit {
  /** 'overlay' = fullscreen modal inside the sheet; 'page' = standalone /rulebook route. */
  @Input() mode: 'overlay' | 'page' = 'overlay';
  @Input() startPage?: string;
  @Output() close = new EventEmitter<void>();

  private service = inject(RulebookService);
  private sanitizer = inject(DomSanitizer);
  private injector = inject(Injector);
  private route = inject(ActivatedRoute, { optional: true });

  readonly pages = this.service.pages;
  readonly activeId = signal<string | null>(null);
  readonly html = signal<SafeHtml | null>(null);
  readonly headings = signal<readonly RulebookHeading[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly fatal = signal<string | null>(null);

  private history = signal<HistoryEntry[]>([]);
  readonly canGoBack = computed(() => this.history().length > 0);

  /** Tab whose section dropdown is currently open (hover/focus). */
  readonly openMenu = signal<string | null>(null);
  private menuTimer: ReturnType<typeof setTimeout> | null = null;

  // Search
  readonly query = signal('');
  readonly results = signal<readonly RulebookSearchHit[]>([]);
  readonly searching = signal(false);
  private searchSeq = 0;

  private scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  async ngOnInit(): Promise<void> {
    // When reached via the /rulebook route (rather than embedded in the sheet), render full-page.
    const routePath = this.route?.snapshot.routeConfig?.path ?? '';
    if (routePath.startsWith('rulebook')) this.mode = 'page';
    const routePage = this.route?.snapshot.paramMap.get('page') ?? undefined;
    try {
      const manifest = await this.service.loadManifest();
      const first = manifest.pages[0]?.id;
      const start = this.startPage ?? routePage ?? first;
      if (!start) {
        this.fatal.set('Das Regelwerk enthält noch keine Seiten.');
        this.loading.set(false);
        return;
      }
      await this.openPage(start, undefined, false);
    } catch {
      this.fatal.set('Das Regelwerk konnte nicht geladen werden.');
      this.loading.set(false);
    }
  }

  /** Tab clicks, jump links and Back all funnel through here. */
  async openPage(id: string, anchor?: string, push = true): Promise<void> {
    if (push && this.activeId()) {
      const scrollTop = this.scroller()?.nativeElement.scrollTop ?? 0;
      this.history.update((h) => [...h, { pageId: this.activeId()!, scrollTop }]);
    }
    this.loading.set(true);
    this.error.set(null);
    this.activeId.set(id);

    try {
      const result = await this.service.loadPage(id);
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(result.html));
      this.headings.set(result.headings);
      this.loading.set(false);
      this.afterRender(() =>
        anchor ? this.scrollToAnchor(anchor) : this.scroller()?.nativeElement.scrollTo({ top: 0 }),
      );
    } catch {
      this.loading.set(false);
      this.html.set(null);
      this.error.set(`Die Seite „${id}" konnte nicht geladen werden.`);
    }
  }

  retry(): void {
    const id = this.activeId();
    if (id) void this.openPage(id, undefined, false);
  }

  goBack(): void {
    const stack = this.history();
    const prev = stack.at(-1);
    if (!prev) return;
    this.history.set(stack.slice(0, -1));
    void this.openPage(prev.pageId, undefined, false).then(() =>
      this.afterRender(() => this.scroller()?.nativeElement.scrollTo({ top: prev.scrollTop })),
    );
  }

  /** One delegated listener — survives every re-render of the [innerHTML] content. */
  onContentClick(event: MouseEvent): void {
    const el = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-rb-page],[data-rb-anchor]',
    );
    if (!el) return;
    event.preventDefault();
    const page = el.getAttribute('data-rb-page') ?? '';
    const anchor = el.getAttribute('data-rb-anchor') ?? undefined;
    if (page && page !== this.activeId()) {
      void this.openPage(page, anchor);
    } else {
      // Same-page anchor: still push history so Back returns to where you were reading.
      const scrollTop = this.scroller()?.nativeElement.scrollTop ?? 0;
      this.history.update((h) => [...h, { pageId: this.activeId()!, scrollTop }]);
      this.scrollToAnchor(anchor);
    }
  }

  onTabClick(id: string): void {
    if (id !== this.activeId()) void this.openPage(id);
  }

  @HostListener('document:keydown.alt.arrowleft', ['$event'])
  onAltLeft(event: Event): void {
    if (!this.canGoBack()) return;
    event.preventDefault();
    this.goBack();
  }

  // ── Tab section dropdowns ────────────────────────────────────────────────────
  onTabEnter(id: string): void {
    if (this.menuTimer) clearTimeout(this.menuTimer);
    this.openMenu.set(id);
  }

  /** Small delay so moving the pointer from the tab into the dropdown doesn't close it. */
  onTabLeave(): void {
    if (this.menuTimer) clearTimeout(this.menuTimer);
    this.menuTimer = setTimeout(() => this.openMenu.set(null), 320);
  }

  /** Inline mask for a tab icon — any file in public/icons works, no CSS class needed. */
  iconStyle(name: string): string {
    const safe = (name ?? '').trim().toLowerCase();
    return /^[a-z0-9_-]+$/.test(safe) ? `--rb-icon:url(/icons/${safe}.svg)` : '';
  }

  outlineOf(id: string): RulebookPage['outline'] {
    return this.pages().find((p) => p.id === id)?.outline ?? [];
  }

  jumpFromMenu(pageId: string, anchor: string): void {
    this.openMenu.set(null);
    void this.openPage(pageId, anchor);
  }

  // ── Search ───────────────────────────────────────────────────────────────────
  async onQueryChange(value: string): Promise<void> {
    this.query.set(value);
    const seq = ++this.searchSeq;
    if (value.trim().length < 2) {
      this.results.set([]);
      this.searching.set(false);
      return;
    }
    this.searching.set(true);
    const hits = await this.service.search(value);
    if (seq !== this.searchSeq) return; // a newer query already ran
    this.results.set(hits);
    this.searching.set(false);
  }

  openHit(hit: RulebookSearchHit): void {
    this.clearSearch();
    void this.openPage(hit.pageId, hit.anchor);
  }

  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.searching.set(false);
    this.searchSeq++;
  }

  private scrollToAnchor(anchor?: string): void {
    if (!anchor) return;
    const host = this.scroller()?.nativeElement;
    const target = host?.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`);
    if (!target) return;
    // A jump target may live inside a collapsed section — open the whole <details> chain.
    let node: HTMLElement | null = target;
    while (node) {
      const details: HTMLDetailsElement | null = node.closest('details');
      if (!details) break;
      details.open = true;
      node = details.parentElement;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** The [innerHTML] DOM only exists after the next render — not when the signal is set. */
  private afterRender(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }
}
