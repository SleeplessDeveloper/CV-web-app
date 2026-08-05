import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationsComponent } from './certifications.component';
import { CvDataService } from '../../core/services/cv-data.service';

describe('CertificationsComponent', () => {
  let component: CertificationsComponent;
  let fixture: ComponentFixture<CertificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationsComponent);
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

    it('AC-24: renders 7 .cert-card elements', () => {
      const cards: NodeListOf<Element> =
        fixture.nativeElement.querySelectorAll('.cert-card');
      expect(cards.length).toBe(7);
    });

    // Count alone would stay green if the template bound the wrong expression
    // (e.g. {{ cert.title }} on a string[]), rendering 7 empty cards.
    it('AC-24 (depth): the cards render the certification text, including the en-dashed titles', () => {
      const texts: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.cert-card')
      ).map((el: any) => el.textContent.trim());

      const EN_DASH = String.fromCharCode(0x2013);

      expect(texts.some(t => t.includes(`ASP.NET Core ${EN_DASH} Solid and Clean Architecture`))).toBe(true);
      expect(texts.some(t => t.includes('Understanding APIs and RESTful APIs'))).toBe(true);
      expect(texts.some(t => t.includes(`Selenium WebDriver with C# from Scratch ${EN_DASH} NUnit Framework`))).toBe(true);

      // No card is blank.
      for (const text of texts) {
        expect(text.length).toBeGreaterThan(0);
      }
    });
  });

  describe('null / empty boundaries', () => {
    it('renders nothing and does not throw when cvData is null', () => {
      component.cvData = null;
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(fixture.nativeElement.querySelectorAll('.cert-card').length).toBe(0);
    });
  });
});
