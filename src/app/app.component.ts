import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header>
        <h1>Todum</h1>
      </header>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    header {
      background-color: #333;
      color: white;
      padding: 1rem;
      
      h1 {
        margin: 0;
        font-size: 1.5rem;
      }
    }

    main {
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'Todum';
}
