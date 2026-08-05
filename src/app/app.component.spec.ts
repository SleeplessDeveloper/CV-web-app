import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // AppComponent is NOT standalone, so it belongs in `declarations`; TestBed
      // `imports` only accepts standalone components and NgModules. Passing it to
      // `imports` produced "Unexpected directive 'AppComponent' imported by the
      // module 'DynamicTestModule'".
      declarations: [AppComponent],
      // app.component.html is exactly <router-outlet></router-outlet>, so the
      // outlet directive has to be resolvable. RouterOutlet is standalone in
      // Angular 18, so it is legal here alongside `declarations`.
      //
      // Deliberately NOT using CUSTOM_ELEMENTS_SCHEMA / NO_ERRORS_SCHEMA: those
      // would silence the unknown-element error instead of resolving the
      // dependency, so a genuinely broken template would still pass.
      //
      // Deliberately NOT using RouterTestingModule: it is deprecated in the
      // installed Angular 18.2 ("Use provideRouter or RouterModule/
      // RouterModule.forRoot instead") because its Location fakes are obsolete —
      // MockPlatformLocation is already a TestBed default.
      imports: [RouterOutlet],
      // Supplies Router and ActivatedRoute. Initial navigation is triggered only
      // through APP_BOOTSTRAP_LISTENER, which never fires under TestBed, so no
      // stray navigation happens and no fakeAsync/tick is needed.
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'cv-web-app' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('cv-web-app');
  });

  it('should render the router outlet', () => {
    // Rewritten. This previously asserted an <h1> containing 'Hello, cv-web-app',
    // which app.component.html has never rendered — it contains only
    // <router-outlet>. That assertion was `ng new` scaffolding and could not pass
    // even once the TestBed configuration was fixed. Asserting the outlet keeps a
    // real test of what the component actually renders, rather than deleting the
    // case to reach green.
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // The DIRECTIVE must have resolved — not merely an element with that tag
    // name. querySelector('router-outlet') alone is truthy for an unknown
    // element too, so on its own it would still pass if someone swapped the
    // RouterOutlet import for CUSTOM_ELEMENTS_SCHEMA. This assertion is what
    // makes that substitution fail.
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();

    // Pins the removal of the `ng new` scaffold's <h1>, which was deleted back in
    // 3e6c7c4 when the real app was built. Guards against it creeping back.
    expect(compiled.querySelector('h1')).toBeNull();
  });
});
