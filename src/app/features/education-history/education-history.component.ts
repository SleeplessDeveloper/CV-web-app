import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CVData } from '../../core/models/cv.model';

@Component({
  selector: 'app-education-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-history.component.html',
  styleUrl: './education-history.component.scss'
})
export class EducationHistoryComponent {
@Input() cvData: CVData | null = null ;
}
