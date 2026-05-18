import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

/**
 * Servicio encargado de la gestión de autenticación de usuarios.
 * Maneja el inicio de sesión, cierre de sesión y el estado del usuario actual.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _supabase = inject(SupabaseService);
  private _router = inject(Router);

  /**
   * Signal que mantiene el usuario actual autenticado.
   */
  public currentUser = signal<User | null>(null);

  /**
   * Signal que mantiene el rol del usuario ('admin', 'cliente' o null).
   */
  public userRole = signal<string | null>(null);

  constructor() {
    this._initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación y escucha cambios.
   * @private
   */
  private async _initializeAuth(): Promise<void> {
    // Obtener usuario actual al cargar el servicio
    const { data } = await this._supabase.client.auth.getUser();
    if (data.user) {
      this.currentUser.set(data.user);
      this._loadUserRole(data.user.id);
    }

    // Escuchar cambios en el estado de autenticación (login/logout/etc)
    this._supabase.client.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        this._loadUserRole(session.user.id);
      } else {
        this.userRole.set(null);
      }
    });
  }

  /**
   * Carga el rol del usuario desde la tabla personalizada 'usuarios'.
   */
  private async _loadUserRole(userId: string): Promise<void> {
    try {
      const { data } = await this._supabase.client
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();
      
      this.userRole.set(data?.rol || 'cliente');
    } catch (error) {
      console.error('Error cargando rol:', error);
      this.userRole.set('cliente');
    }
  }

  /**
   * Inicia sesión con correo y contraseña.
   * @param email Correo electrónico del usuario.
   * @param password Contraseña del usuario.
   * @returns Promesa con el resultado de la autenticación.
   */
  public async login(email: string, password: string) {
    const { data, error } = await this._supabase.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Verificar rol del usuario para redirección, usando maybeSingle para no lanzar error si falta el perfil
    const { data: userData, error: roleError } = await this._supabase.client
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .maybeSingle();
      
    if (roleError) {
      console.warn('Error fetching user role on login:', roleError);
    }
      
    this._redirectBasedOnRole(userData?.rol);
    
    return data;
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  public async logout(): Promise<void> {
    const { error } = await this._supabase.client.auth.signOut();
    if (error) throw error;
    
    this.currentUser.set(null);
    this._router.navigate(['/home']);
  }

  /**
   * Redirige al usuario a la página correspondiente según su rol.
   * @param rol Rol del usuario ('admin' o 'cliente').
   * @private
   */
  private _redirectBasedOnRole(rol: string | undefined): void {
    if (rol === 'admin') {
      this._router.navigate(['/admin/products']);
    } else {
      this._router.navigate(['/home']);
    }
  }
}
