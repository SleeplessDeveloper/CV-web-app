import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CVData } from '../../core/models/cv.model';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certifications.component.html',
  styleUrl: './certifications.component.scss'
})
export class CertificationsComponent {
@Input() cvData: CVData | null = null;
}
