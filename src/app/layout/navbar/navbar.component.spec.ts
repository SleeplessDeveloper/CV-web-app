import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  const nav = () => fixture.nativeElement.querySelector('nav.navbar') as HTMLElement;
  const menu = () => fixture.nativeElement.querySelector('.navbar-menu') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // `declarations`, not `imports`: NavbarComponent is NOT standalone. See the
      // note in footer.component.spec.ts.
      //
      // No module import is needed. The template uses [src], (click),
      // [class.scrolled] and [class.active] — all core binding syntax. In
      // particular [class.x] is CLASS BINDING, not NgClass, so CommonModule is
      // not required here.
      declarations: [NavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Defensive, not load-bearing: the CLI's default TestBed teardown already
    // destroys fixtures between specs, and a window listener registered by
    // @HostListener does not in fact survive it. Kept because the component
    // registers a scroll listener and an explicit destroy documents that intent.
    // Optional-chained because if beforeEach throws before assigning `fixture`,
    // an unguarded call throws a second, more confusing error over the real one.
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders un-scrolled with the mobile menu closed', () => {
    // Asserted through the DOM, not by re-reading the `= false` field
    // initialisers. This is what validates the reasoning behind using
    // `declarations` alone: if [class.scrolled] / [class.active] were not being
    // applied, these would not track the component state.
    expect(nav().classList.contains('scrolled')).toBe(false);
    expect(menu().classList.contains('active')).toBe(false);
  });

  it('toggles the mobile menu open and closed', () => {
    component.toggleMobileMenu();
    fixture.detectChanges();
    expect(component.isMobileMenuOpen).toBe(true);
    expect(menu().classList.contains('active')).toBe(true);

    component.toggleMobileMenu();
    fixture.detectChanges();
    expect(component.isMobileMenuOpen).toBe(false);
    expect(menu().classList.contains('active')).toBe(false);
  });

  it('adds the scrolled class when the window is scrolled past the threshold', () => {
    // Driven by a real scroll EVENT, not by calling onWindowScroll() directly.
    // Calling the method directly would leave the @HostListener('window:scroll')
    // decorator itself untested — it could be deleted and every navbar test would
    // still pass while the live navbar never gained its scrolled state.
    //
    // spyOnProperty, not Object.defineProperty: `window.scrollY` is an own
    // ACCESSOR on window, so defineProperty with a `value` replaces it with a
    // data property for the rest of the Karma run (all specs share one browser
    // context) — and restoring a value afterwards does not restore the getter.
    // Jasmine restores the real descriptor after each spec automatically.
    const scrollY = spyOnProperty(window, 'scrollY', 'get');

    // 51/50 rather than 100/0, so the `> 50` threshold itself is pinned:
    // loosening it to `> 0` or `> 10` would keep coarser values green.
    scrollY.and.returnValue(51);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isScrolled).toBe(true);
    expect(nav().classList.contains('scrolled')).toBe(true);

    scrollY.and.returnValue(50);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isScrolled).toBe(false);
    expect(nav().classList.contains('scrolled')).toBe(false);
  });
});
