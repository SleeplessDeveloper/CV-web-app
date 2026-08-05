import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { CvDataService } from '../../core/services/cv-data.service';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
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

    it('AC-21: renders 6 .project-card elements whose h3 text matches the CV order', () => {
      const cards: NodeListOf<Element> =
        fixture.nativeElement.querySelectorAll('.project-card');
      expect(cards.length).toBe(6);

      const names = Array.from(cards).map(
        card => card.querySelector('h3')?.textContent?.trim()
      );
      const EN_DASH = '–';
      expect(names).toEqual([
        `Education ${EN_DASH} Student Applications System`,
        `Education ${EN_DASH} Student Registrations System`,
        `Education ${EN_DASH} Alumni`,
        `Education ${EN_DASH} TVET Student Success Tracker`,
        `Education ${EN_DASH} Student Success Agent`,
        'ITS Ignite'
      ]);
    });

    // Card count and titles can all be right while the body of every card renders
    // empty — dropping the inner *ngFor over highlights or technologies would keep
    // AC-21 green. Spec risk R2, one level below the card.
    it('AC-21 (depth): every card renders 3 highlight bullets and at least one tech badge', () => {
      const cards = Array.from(
        fixture.nativeElement.querySelectorAll('.project-card')
      );

      expect(cards.length).toBe(6);
      for (const card of cards as any[]) {
        expect(card.querySelectorAll('.project-highlights li').length).toBe(3);
        expect(card.querySelectorAll('.tech-badge').length).toBeGreaterThan(0);
      }
    });

    it('AC-20/INV-6: each project\'s technologies are traceable to that project, not borrowed from another', () => {
      const projects = component.cvData!.projects;

      // Anchors the spec's Data Model asked for. Each is named in that project's
      // own CV prose.
      expect(projects[2].technologies).toContain('JHipster');
      expect(projects[3].technologies).toContain('Java 21');
      expect(projects[4].technologies).toEqual(
        jasmine.arrayContaining(['Temporal', 'AWS Bedrock'])
      );
      expect(projects[5].technologies).toContain('React 18 (Vite)');

      // The precise "invented from another project" defect INV-6 names: Alumni is
      // the only JHipster/Oracle project, so these must not leak elsewhere.
      expect(projects[5].technologies).not.toContain('JHipster');
      expect(projects[0].technologies).not.toContain('JHipster');

      // Cheap structural guards: no placeholder or duplicated prose.
      expect(new Set(projects.map(p => p.description)).size).toBe(6);
      for (const project of projects) {
        expect(project.technologies.length).toBeGreaterThan(0);
        for (const highlight of project.highlights) {
          expect(highlight.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('null / empty boundaries', () => {
    it('renders nothing and does not throw when cvData is null', () => {
      component.cvData = null;
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(fixture.nativeElement.querySelectorAll('.project-card').length).toBe(0);
    });
  });
});
