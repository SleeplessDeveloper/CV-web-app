import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CVData } from '../../core/models/cv.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
@Input() cvData: CVData | null = null;
}
