import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'proj1';
  private aa = signal('a');
  ngOnInit(): void {
    this.aaa();
  }
  public aaa() {
    console.log('🚀 ~ AppComponent ~ aa:', this.aa());
  }
}
