import { Component } from '@angular/core';
import { ScenesComponent } from './scenes/scenes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScenesComponent],
  styleUrl: './app.component.scss',
  template: `<app-scenes /> `,
})
export class AppComponent {}
