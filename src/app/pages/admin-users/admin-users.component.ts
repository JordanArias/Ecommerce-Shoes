import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Core
import { UserService } from '../../core/services/user.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AppUser } from '../../core/models/user.model';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Componente administrativo para la gestión de usuarios.
 * Permite visualizar perfiles, cambiar roles, editar información y dar de alta nuevos usuarios.
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  // --- Inyecciones ---
  private _userService = inject(UserService);
  private _supabase = inject(SupabaseService);

  // --- Estado de Datos ---
  /** Lista de perfiles de usuario registrados */
  public users = signal<AppUser[]>([]);
  /** Estado de carga general */
  public loading = signal(true);

  // --- Estado de Modal de Registro (Add User) ---
  public showAddModal = signal(false);
  public newEmail = signal('');
  public newPassword = signal('');
  public newNombre = signal('');
  public newApellidos = signal('');
  public addLoading = signal(false);
  public addError = signal<string | null>(null);

  // --- Estado de Modal de Edición (Edit User) ---
  public showEditModal = signal(false);
  public editUser = signal<AppUser | null>(null);
  public editNombre = signal('');
  public editApellidos = signal('');
  public editTelefono = signal('');

  // --- Ciclo de Vida ---
  ngOnInit(): void {
    this._loadUsers();
  }

  /**
   * Carga la lista completa de usuarios desde el servicio.
   * @private
   */
  private async _loadUsers(): Promise<void> {
    try {
      this.loading.set(true);
      const data = await this._userService.getUsers();
      this.users.set(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Alterna el rol de un usuario entre 'admin' y 'cliente'.
   * @param user Perfil del usuario a modificar.
   */
  public async toggleRole(user: AppUser): Promise<void> {
    const newRole = user.rol === 'admin' ? 'cliente' : 'admin';
    if (confirm(`¿Cambiar el rol de ${user.nombre} a ${newRole}?`)) {
      try {
        await this._userService.updateUserRole(user.id, newRole);
        await this._loadUsers();
      } catch (error: any) {
        console.error('Error al actualizar rol:', error);
        alert('Error al actualizar el rol del usuario: ' + (error.message || JSON.stringify(error)));
      }
    }
  }

  // --- Gestión de Nuevo Usuario ---

  public openAddModal(): void {
    this.newEmail.set('');
    this.newPassword.set('');
    this.newNombre.set('');
    this.newApellidos.set('');
    this.addError.set(null);
    this.showAddModal.set(true);
  }

  public closeAddModal(): void {
    this.showAddModal.set(false);
  }

  /**
   * Registra un nuevo usuario directamente desde el panel administrativo.
   */
    public async createUser(): Promise<void> {
    try {
      this.addLoading.set(true);
      this.addError.set(null);

      const emailValue = this.newEmail().trim().toLowerCase();
      if (!emailValue.endsWith('@gmail.com')) {
        throw new Error('Solo se permiten registrar cuentas de @gmail.com');
      }

      const passValue = this.newPassword();
      if (passValue.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Usamos un cliente temporal sin persistencia para crear el usuario
      // Esto evita que el administrador actual cierre su sesión accidentalmente
      const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { error } = await tempClient.auth.signUp({
        email: this.newEmail(),
        password: this.newPassword(),
        options: {
          data: {
            nombre: this.newNombre(),
            apellidos: this.newApellidos()
          }
        }
      });

      if (error) throw error;
      
      this.closeAddModal();
      // Espera un segundo para que el trigger de BD procese el nuevo registro
      setTimeout(() => this._loadUsers(), 1000);
    } catch (error: any) {
      this.addError.set(error.message || 'Error al crear el usuario');
    } finally {
      this.addLoading.set(false);
    }
  }

  // --- Gestión de Edición de Perfil ---

  public openEditModal(user: AppUser): void {
    this.editUser.set(user);
    this.editNombre.set(user.nombre);
    this.editApellidos.set(user.apellidos);
    this.editTelefono.set(user.telefono || '');
    this.showEditModal.set(true);
  }

  public closeEditModal(): void {
    this.showEditModal.set(false);
  }

  /**
   * Guarda los cambios en el perfil del usuario editado.
   */
  public async saveUser(): Promise<void> {
    const user = this.editUser();
    if (!user) return;
    
    try {
      await this._userService.updateUser(user.id, {
        nombre: this.editNombre(),
        apellidos: this.editApellidos(),
        telefono: this.editTelefono() || null
      });
      this.closeEditModal();
      await this._loadUsers();
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar los datos del usuario: ' + (error.message || JSON.stringify(error)));
    }
  }

  // --- Gestión de Eliminación ---

  /**
   * Elimina un perfil de usuario (solo datos de tabla perfiles).
   */
  public async deleteUser(user: AppUser): Promise<void> {
    if (confirm(`¿Eliminar perfil de ${user.nombre} ${user.apellidos}? Esta acción no se puede deshacer.`)) {
      try {
        await this._userService.deleteUser(user.id);
        await this._loadUsers();
      } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario: ' + (error.message || JSON.stringify(error)));
      }
    }
  }
}
