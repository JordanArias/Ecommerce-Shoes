import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

/**
 * Componente raíz de la aplicación (App Shell).
 * Define la estructura global que incluye la barra de navegación,
 * el área de contenido dinámico (router-outlet) y el pie de página.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  /** Título interno de la aplicación */
  public readonly title = signal('sneaker-store');
}
