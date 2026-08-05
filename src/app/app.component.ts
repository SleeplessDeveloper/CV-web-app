import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Intentionally empty. AppComponent's only job is to host the router outlet
  // (see app.component.html). The scaffolded `title = 'cv-web-app'` field was
  // removed in #21 — nothing bound it, and the page title users actually see
  // comes from <title> in src/index.html.
}
