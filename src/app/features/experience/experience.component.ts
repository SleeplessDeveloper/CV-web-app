import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CVData } from '../../core/models/cv.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss'
})
export class ExperienceComponent {
@Input() cvData:CVData | null = null;
}
