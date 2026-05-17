import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Servicio central para la conexión con Supabase.
 * Proporciona el cliente de Supabase configurado con las credenciales del entorno.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  /**
   * Instancia del cliente de Supabase.
   */
  public client: SupabaseClient;

  constructor() {
    // Inicializa el cliente de Supabase usando la URL y la Key de los environments
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }
}
