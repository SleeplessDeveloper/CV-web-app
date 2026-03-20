import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CVData } from '../../core/models/cv.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
@Input() cvData: CVData | null = null;
}
