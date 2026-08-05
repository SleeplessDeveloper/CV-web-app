import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsComponent } from './skills.component';
import { CvDataService } from '../../core/services/cv-data.service';

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
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

    it('AC-5: renders exactly 11 .skill-category blocks, whose h3 text equals the AC-2 category list in order', () => {
      const categoryEls: NodeListOf<Element> =
        fixture.nativeElement.querySelectorAll('.skill-category');
      expect(categoryEls.length).toBe(11);

      const headingTexts = Array.from(categoryEls).map(
        el => el.querySelector('h3')?.textContent?.trim()
      );
      expect(headingTexts).toEqual([
        'Programming Languages',
        'Frontend Frameworks & Libraries',
        'Backend Frameworks & Libraries',
        'Databases',
        'Messaging & Async',
        'AI / LLM Engineering',
        'Web Technologies',
        'Security',
        'Testing',
        'DevOps & Tools',
        'Software Engineering Practices'
      ]);
    });

    it('AC-8 (negative): no rendered h3 reads the removed/renamed old category headings', () => {
      const headingTexts: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.skill-category h3')
      ).map((el: any) => el.textContent.trim());

      // AC-8 as amended at stage 5: only three old headings disappeared under
      // every name — 'Languages' (became 'Programming Languages'),
      // 'Frameworks & Libraries' (split into Frontend/Backend) and
      // 'Methodologies' (became 'Software Engineering Practices').
      // 'Web Technologies', like 'Databases' and 'DevOps & Tools', is a
      // legitimately retained name and is asserted PRESENT below — the
      // criterion originally required its absence, which contradicted AC-2.
      expect(headingTexts).not.toContain('Languages');
      expect(headingTexts).not.toContain('Frameworks & Libraries');
      expect(headingTexts).not.toContain('Methodologies');

      // 'Databases', 'DevOps & Tools' and 'Web Technologies' are legitimately
      // retained names and must NOT be asserted absent here.
      expect(headingTexts).toContain('Databases');
      expect(headingTexts).toContain('DevOps & Tools');
      expect(headingTexts).toContain('Web Technologies');
    });

    // Without this, the category count and headings can all be correct while the
    // tags themselves render empty — e.g. dropping the inner *ngFor, or slicing
    // items. 11 headings would still pass AC-5 with the 13-item DevOps row
    // reduced to nothing. This is spec risk R2 one level below the category.
    it('AC-5 (depth): each category renders one .skill-tag per item, counts 6,6,7,7,6,7,5,5,8,13,9 in order', () => {
      const perCategory = Array.from(
        fixture.nativeElement.querySelectorAll('.skill-category')
      ).map((el: any) => el.querySelectorAll('.skill-tag').length);

      expect(perCategory).toEqual([6, 6, 7, 7, 6, 7, 5, 5, 8, 13, 9]);
    });

    it('AC-5 (depth): an item containing internal commas reaches the DOM as ONE tag', () => {
      const tagTexts: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.skill-tag')
      ).map((el: any) => el.textContent.trim());

      // Doubles as the comma-split guard at the render layer, not just in data.
      expect(tagTexts).toContain('Azure DevOps (CI/CD, Repos, Boards)');
      expect(tagTexts).toContain('OCR (Tesseract, Microblink, Azure OCR, OCR.Space)');
      expect(tagTexts).not.toContain('Repos');
      expect(tagTexts).not.toContain('Microblink');
    });
  });

  describe('null / empty boundaries', () => {
    it('renders nothing and does not throw when cvData is null', () => {
      component.cvData = null;
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(fixture.nativeElement.querySelectorAll('.skill-category').length).toBe(0);
    });

    it('renders no categories when skills is an empty array', () => {
      component.cvData = { skills: [] } as any;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.skill-category').length).toBe(0);
    });
  });

  describe('AC-6: headings come from data, not markup', () => {
    it('renders exactly two h3 elements reading the stub category names, in order', () => {
      component.cvData = {
        skills: [
          { name: 'Alpha', items: ['a'] },
          { name: 'Beta', items: ['b'] }
        ]
      } as any;
      fixture.detectChanges();

      const headings: string[] = Array.from(
        fixture.nativeElement.querySelectorAll('.skill-category h3')
      ).map((el: any) => el.textContent.trim());

      expect(headings.length).toBe(2);
      expect(headings).toEqual(['Alpha', 'Beta']);
    });
  });
});
