import { Component } from '@angular/core';
import { ScenesComponent } from './scenes/scenes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScenesComponent],
  template: `<app-scenes /> `,
})
export class AppComponent {}
