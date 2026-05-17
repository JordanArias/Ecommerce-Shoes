import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AppUser } from '../models/user.model';

/**
 * Servicio para la gestión de perfiles de usuario y administración de cuentas.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _supabase = inject(SupabaseService);

  /**
   * Obtiene la lista de todos los usuarios registrados.
   * @returns Promesa con array de AppUser.
   */
  public async getUsers(): Promise<AppUser[]> {
    const { data, error } = await this._supabase.client
      .from('usuarios')
      .select('*')
      .order('creado_en', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Actualiza el rol de un usuario específico.
   * @param id ID del usuario.
   * @param rol Nuevo rol ('admin' | 'cliente').
   */
  public async updateUserRole(id: string, rol: 'admin' | 'cliente'): Promise<AppUser> {
    const { data, error } = await this._supabase.client
      .from('usuarios')
      .update({ rol })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Actualiza los datos generales de un usuario.
   * @param id ID del usuario.
   * @param updates Objeto con los campos a actualizar.
   */
  public async updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
    const { data, error } = await this._supabase.client
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Elimina un usuario de la base de datos de perfiles.
   * @param id ID del usuario.
   */
  public async deleteUser(id: string): Promise<boolean> {
    const { error } = await this._supabase.client
      .from('usuarios')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
}
