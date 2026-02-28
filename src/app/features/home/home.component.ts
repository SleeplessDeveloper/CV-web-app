import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvDataService } from '../../core/services/cv-data.service';
import { CVData } from '../../core/models/cv.model';
import { AboutComponent } from "../about";
import { SkillsComponent } from '../skills';
import { ExperienceComponent } from '../experience';
import { ProjectsComponent } from "../projects";
import { ContactComponent } from "../contact";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AboutComponent, SkillsComponent, ExperienceComponent, ProjectsComponent, ContactComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  cvData!: CVData;
  currentRole = '';
  roles = ['Full-Stack Developer', 'Angular Specialist', 'Backend Engineer', '.NET Developer'];
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
    window.print();
  }
}
