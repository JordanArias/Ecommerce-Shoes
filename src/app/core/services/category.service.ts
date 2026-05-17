import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Category } from '../models/product.model';

/**
 * Servicio para la gestión de categorías de productos.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private _supabase = inject(SupabaseService);

  /**
   * Obtiene la lista completa de categorías disponibles.
   */
  public async getCategories(): Promise<Category[]> {
    const { data, error } = await this._supabase.client
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Crea una nueva categoría.
   */
  public async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await this._supabase.client
      .from('categorias')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Elimina una categoría por su ID.
   */
  public async deleteCategory(id: string): Promise<boolean> {
    const { error } = await this._supabase.client
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
