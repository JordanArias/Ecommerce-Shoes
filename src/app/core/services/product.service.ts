import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product, ProductVariant } from '../models/product.model';

/**
 * Servicio para la gestión de productos y variantes.
 * Centraliza todas las operaciones CRUD y consultas relacionadas con productos.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private _supabase = inject(SupabaseService);

  /**
   * Obtiene todos los productos activos de la base de datos.
   * @returns Promesa con el array de productos.
   */
  public async getProducts(): Promise<Product[]> {
    const { data, error } = await this._supabase.client
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('estado', 'activo')
      .order('creado_en', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Obtiene todos los productos sin filtrar por estado.
   * Útil para paneles de administración.
   */
  public async getAllProducts(): Promise<Product[]> {
    const { data, error } = await this._supabase.client
      .from('productos')
      .select('*, categorias(nombre)')
      .order('creado_en', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Crea un nuevo producto.
   * @param product Datos del producto (excluyendo ID y relaciones).
   */
  public async createProduct(product: Omit<Product, 'id' | 'categorias'>) {
    const { data, error } = await this._supabase.client
      .from('productos')
      .insert([product])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Actualiza un producto existente.
   * @param id ID del producto.
   * @param updates Campos a actualizar.
   */
  public async updateProduct(id: string, updates: Partial<Product>) {
    const payload = { ...updates };
    delete payload.categorias; // Eliminar relaciones para evitar errores de actualización

    const { data, error } = await this._supabase.client
      .from('productos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Elimina un producto de la base de datos.
   * @param id ID del producto.
   */
  public async deleteProduct(id: string): Promise<boolean> {
    const { error } = await this._supabase.client
      .from('productos')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }

  /**
   * Obtiene los productos marcados como destacados.
   */
  public async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await this._supabase.client
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('estado', 'activo')
      .eq('destacado', true);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Obtiene un producto específico por su ID.
   */
  public async getProductById(id: string): Promise<Product> {
    const { data, error } = await this._supabase.client
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Obtiene las variantes disponibles para un producto.
   * @param productId ID del producto.
   */
  public async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await this._supabase.client
      .from('producto_variantes')
      .select('*')
      .eq('producto_id', productId);
    
    if (error) throw error;
    return data || [];
  }
}
