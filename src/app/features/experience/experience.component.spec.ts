import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceComponent } from './experience.component';
import { CvDataService } from '../../core/services/cv-data.service';

describe('ExperienceComponent', () => {
  let component: ExperienceComponent;
  let fixture: ComponentFixture<ExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('bound to the real CvDataService data', () => {
    beforeEach(() => {
      const cvDataService = TestBed.inject(CvDataService);
      component.cvData = cvDataService.getCVData();
      fixture.detectChanges();
    });

    it('AC-16: renders ZERO h4 elements (no category on any real responsibility)', () => {
      // Queries the whole section, not '.responsibility-group h4'. Scoping to the
      // group would report 0 even if the heading were moved one level up into
      // '.responsibilities' and its *ngIf dropped — every entry would then render
      // an empty <h4> and this test would still pass. AC-16 says zero h4 in the
      // section, so assert exactly that.
      expect(fixture.nativeElement.querySelectorAll('h4').length).toBe(0);
      expect(
        fixture.nativeElement.querySelectorAll('.responsibility-group h4').length
      ).toBe(0);
    });

    it('AC-13 (depth): the rendered titles and en-dashed periods reach the DOM', () => {
      const EN_DASH = String.fromCharCode(0x2013);

      const titles: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.timeline-item h3')
      ).map((el: any) => el.textContent.trim());
      expect(titles).toEqual(['Software Developer', 'Graduate Software Developer']);

      // The most user-visible en dash on the site.
      const periods: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.timeline-item .period')
      ).map((el: any) => el.textContent.trim());
      expect(periods).toEqual([
        `July 2024 ${EN_DASH} Present`,
        `July 2023 ${EN_DASH} June 2024`
      ]);
    });

    it('bullet counts are 7 (entry 0) and 6 (entry 1), matching AC-14', () => {
      const timelineItems = fixture.nativeElement.querySelectorAll(
        '.timeline-item'
      );
      expect(timelineItems.length).toBe(2);

      const bulletCounts = Array.from(timelineItems).map(
        (item: any) => item.querySelectorAll('li').length
      );
      expect(bulletCounts).toEqual([7, 6]);
    });
  });

  describe('AC-16: a categorised stub renders exactly one h4 reading the category name', () => {
    it('renders "Backend" when the responsibility has category: "Backend"', () => {
      component.cvData = {
        experience: [
          {
            title: 'Some Title',
            company: 'Some Co',
            period: '2020 - 2021',
            responsibilities: [
              { category: 'Backend', items: ['did backend things'] }
            ]
          }
        ]
      } as any;
      fixture.detectChanges();

      const h4s = fixture.nativeElement.querySelectorAll(
        '.responsibility-group h4'
      );
      expect(h4s.length).toBe(1);
      expect(h4s[0].textContent.trim()).toBe('Backend');
    });
  });
});
