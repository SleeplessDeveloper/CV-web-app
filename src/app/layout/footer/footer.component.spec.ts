import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // `declarations`, not `imports`: FooterComponent is NOT standalone, and
      // TestBed `imports` only accepts standalone components and NgModules.
      // Passing it there is what produced "Unexpected directive 'FooterComponent'
      // imported by the module 'DynamicTestModule'".
      //
      // No module import is needed alongside it. The template's only binding is
      // the interpolation {{ currentYear }}, which is core template syntax.
      declarations: [FooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Defensive rather than load-bearing — the CLI's default teardown already
    // destroys fixtures. Optional-chained so a throw in beforeEach cannot mask
    // the real error with a TypeError from here.
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    // Pins the field against the real clock. Paired with the render assertion
    // below, which deliberately asserts against component.currentYear rather
    // than a freshly-computed year — together they cover both "the value is
    // right" and "the value reaches the DOM", with no year-boundary race.
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('renders the copyright line with the current year', () => {
    // Scoped to the specific paragraph, not the whole footer's textContent:
    // the tagline "Built with Angular 18 …" also lives in this component, so an
    // unscoped assertion could pass on unrelated text.
    const copyright: string =
      fixture.nativeElement.querySelector('.footer-content p').textContent;

    expect(copyright).toContain(String(component.currentYear));
    expect(copyright).toContain('Siphephelo Sibanyoni');
  });
});
