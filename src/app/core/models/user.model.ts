/**
 * Interfaz que representa los datos de perfil de un usuario en la base de datos.
 */
export interface AppUser {
  id: string;
  nombre: string;
  apellidos: string;
  rol: 'admin' | 'cliente';
  telefono: string | null;
  creado_en: string;
}

/**
 * Interfaz para las respuestas de autenticación.
 */
export interface AuthResponse {
  user: any;
  session: any;
}
