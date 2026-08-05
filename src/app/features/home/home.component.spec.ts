import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { CvDataService } from '../../core/services/cv-data.service';
import { CV_PDF_PATH, CV_PDF_DOWNLOAD_NAME } from '../../core/constants/cv-assets';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]
    })
    .compileComponents();

    // ngOnInit starts animateRole(), which chains setInterval -> setTimeout ->
    // eraseRole -> setInterval -> setTimeout -> animateRole forever. HomeComponent
    // has no ngOnDestroy, so fixture.destroy() cannot stop it and every spec here
    // would leak a self-perpetuating timer chain for the rest of the Karma run —
    // the first fakeAsync test added anywhere in this suite would then fail with
    // "periodic timer(s) still in the queue" pointing at the wrong file.
    // Stubbed before createComponent so the chain never starts. The animation
    // itself is a Non-Goal of this ticket, so it is stubbed rather than fixed.
    spyOn(HomeComponent.prototype, 'animateRole');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('AC-32: downloadCV() uses the exported constants', () => {
    it('builds an anchor whose download equals CV_PDF_DOWNLOAD_NAME and href ends with CV_PDF_PATH, without navigating', () => {
      const realAnchor = document.createElement('a');
      spyOn(realAnchor, 'click');
      spyOn(document, 'createElement').and.returnValue(realAnchor);

      component.downloadCV();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(realAnchor.download).toBe(CV_PDF_DOWNLOAD_NAME);

      // Exact attribute, not endsWith on the resolved .href. endsWith('pdf/cv.pdf')
      // is also true for 'assets/legacy/pdf/cv.pdf' and 'archive/2025/pdf/cv.pdf',
      // both of which 404 — the same substring class the spec bans for URLs.
      expect(realAnchor.getAttribute('href')).toBe(CV_PDF_PATH);
      expect(realAnchor.click).toHaveBeenCalled();
    });
  });

  describe('AC-30 (automatable half): the hero renders the corrected outbound links', () => {
    it('links to the live GitHub and LinkedIn URLs, and not to the dead ones', () => {
      const cvDataService = TestBed.inject(CvDataService);
      component.cvData = cvDataService.getCVData();
      fixture.detectChanges();

      const hrefs = Array.from(
        fixture.nativeElement.querySelectorAll('a')
      ).map((a: any) => a.getAttribute('href'));

      expect(hrefs).toContain('https://github.com/SleeplessDeveloper');
      expect(hrefs).toContain(
        'https://www.linkedin.com/in/siphephelo-sibanyoni-b89a43298'
      );

      // Exact array membership, never endsWith/toContain on the string: the dead
      // LinkedIn URL is a PREFIX of the correct one, so a substring check on the
      // rendered href would pass on the broken value. Guards against the URL being
      // re-hardcoded into the template, which the data-level AC-27 cannot catch.
      expect(hrefs).not.toContain('https://linkedin.com/in/siphephelo-sibanyoni');
      expect(hrefs).not.toContain('https://github.com/siphephelo-sibanyoni');
    });
  });

  describe('AC-29: roles[] realigned to the CV positioning, no stale hardcoded role', () => {
    it('contains no "Angular Specialist" or "Backend Engineer" entries', () => {
      expect(component.roles).not.toContain('Angular Specialist');
      expect(component.roles).not.toContain('Backend Engineer');
    });

    it('has 4 entries', () => {
      expect(component.roles.length).toBe(4);
    });
  });
});
