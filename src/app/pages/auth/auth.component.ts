import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Core
import { AuthService } from '../../core/services/auth.service';

/**
 * Componente para el inicio de sesión de usuarios (Autenticación).
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export default class AuthComponent {
  private _authService = inject(AuthService);
  
  public email = signal('');
  public password = signal('');
  public loading = signal(false);
  public error = signal<string | null>(null);

  public async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    try {
      this.loading.set(true);
      this.error.set(null);
      await this._authService.login(this.email(), this.password());
    } catch (err: any) {
      this.error.set(err.message || 'Error de autenticación');
    } finally {
      this.loading.set(false);
    }
  }
}
