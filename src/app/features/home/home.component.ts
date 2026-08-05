import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvDataService } from '../../core/services/cv-data.service';
import { CVData } from '../../core/models/cv.model';
import { CV_PDF_DOWNLOAD_NAME, CV_PDF_PATH } from '../../core/constants/cv-assets';
import { AboutComponent } from "../about";
import { SkillsComponent } from '../skills';
import { ExperienceComponent } from '../experience';
import { ProjectsComponent } from "../projects";
import { ContactComponent } from "../contact";
import { EducationHistoryComponent } from '../education-history/education-history.component';
import { CertificationsComponent } from '../certifications/certifications.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, 
    AboutComponent, 
    SkillsComponent, 
    ExperienceComponent, 
    ProjectsComponent, 
    ContactComponent,
    EducationHistoryComponent,
  CertificationsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  cvData!: CVData;
  currentRole = '';
  roles = [
    'Full-Stack Developer',
    'Angular & React Developer',
    '.NET & Spring Boot Engineer',
    'Agentic AI Developer'
  ];
  roleIndex = 0;

  constructor(private cvDataService: CvDataService) {}

  ngOnInit() {
    this.cvData = this.cvDataService.getCVData();
    this.animateRole();
  }

  animateRole() {
    let charIndex = 0;
    const currentRoleText = this.roles[this.roleIndex];
    
    const typeInterval = setInterval(() => {
      if (charIndex < currentRoleText.length) {
        this.currentRole += currentRoleText.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          this.eraseRole();
        }, 2000);
      }
    }, 100);
  }

  eraseRole() {
    const eraseInterval = setInterval(() => {
      if (this.currentRole.length > 0) {
        this.currentRole = this.currentRole.slice(0, -1);
      } else {
        clearInterval(eraseInterval);
        this.roleIndex = (this.roleIndex + 1) % this.roles.length;
        setTimeout(() => this.animateRole(), 500);
      }
    }, 50);
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  downloadCV() {
    const link = document.createElement('a');
    link.href = CV_PDF_PATH;
    link.download = CV_PDF_DOWNLOAD_NAME;
    // The anchor must be in the document for a programmatic click to honour
    // `download` in Firefox; Chromium and Edge work either way. Without this the
    // main call-to-action silently does nothing for a share of visitors.
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
