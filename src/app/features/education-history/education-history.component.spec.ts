import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationHistoryComponent } from './education-history.component';
import { CvDataService } from '../../core/services/cv-data.service';

describe('EducationHistoryComponent', () => {
  let component: EducationHistoryComponent;
  let fixture: ComponentFixture<EducationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationHistoryComponent);
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

    it('AC-41: renders exactly 2 .education-card elements, with h3 degree titles in order and .date text "2021"/"2019"', () => {
      const cards: NodeListOf<Element> =
        fixture.nativeElement.querySelectorAll('.education-card');
      expect(cards.length).toBe(2);

      const degreeTitles = Array.from(cards).map(
        card => card.querySelector('h3')?.textContent?.trim()
      );
      expect(degreeTitles).toEqual([
        'Bachelor of Computer and Information Sciences in Application Development',
        'Diploma in Information Technology (Software Development)'
      ]);

      const dates = Array.from(cards).map(
        card => card.querySelector('.date')?.textContent?.trim()
      );
      expect(dates).toEqual(['2021', '2019']);
    });
  });
});
