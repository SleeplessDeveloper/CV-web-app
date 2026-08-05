import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';
import { CvDataService } from '../../core/services/cv-data.service';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function statNumbers(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.stat-number')
    ).map((el: any) => el.textContent.trim());
  }

  /**
   * Looks a stat up by its visible LABEL rather than by document position.
   * Positional assertions pass even if the three labels are swapped, which would
   * make the page read "3 Certifications / 7 Years Experience" — the numbers are
   * unchanged in order, so nothing fails. The label is what a recruiter reads,
   * so the label is what the number must be tied to.
   */
  function statByLabel(label: string): string | undefined {
    const card = Array.from(
      fixture.nativeElement.querySelectorAll('.stat-card')
    ).find(
      (c: any) => c.querySelector('.stat-label')?.textContent?.trim() === label
    ) as Element | undefined;

    return card?.querySelector('.stat-number')?.textContent?.trim();
  }

  describe('bound to the real CvDataService data', () => {
    it('AC-10/AC-11/AC-12: the three .stat-number values read "3", "6", "7" with no "+"', () => {
      const cvDataService = TestBed.inject(CvDataService);
      component.cvData = cvDataService.getCVData();
      fixture.detectChanges();

      const [years, projects, certifications] = statNumbers();
      expect(years).toBe('3');
      expect(projects).toBe('6');
      expect(certifications).toBe('7');

      for (const value of [years, projects, certifications]) {
        expect(value).not.toContain('+');
      }
    });

    it('AC-10/AC-11/AC-12 (label-anchored): each number is tied to its own label, and there are exactly 3 cards', () => {
      const cvDataService = TestBed.inject(CvDataService);
      component.cvData = cvDataService.getCVData();
      fixture.detectChanges();

      expect(statByLabel('Years Experience')).toBe('3');
      expect(statByLabel('Projects Completed')).toBe('6');
      expect(statByLabel('Certifications')).toBe('7');

      // Guards the destructure above: a 4th card would be silently ignored by it.
      expect(fixture.nativeElement.querySelectorAll('.stat-card').length).toBe(3);
    });
  });

  describe('AC-10: "Years Experience" is bound to yearsExperience, not experience.length', () => {
    it('renders 9 (yearsExperience) even though experience.length is 2', () => {
      // Deliberately mismatched yearsExperience vs experience.length to prove
      // the binding is to yearsExperience, never derived from the array —
      // the pre-existing defect this ticket fixes.
      component.cvData = {
        yearsExperience: 9,
        experience: [{}, {}],
        projects: [{}, {}, {}, {}, {}, {}],
        certifications: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
      } as any;
      fixture.detectChanges();

      const [years] = statNumbers();
      expect(years).toBe('9');
      expect(years).not.toContain('+');
    });
  });
});
