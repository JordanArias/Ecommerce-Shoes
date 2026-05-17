import { Routes } from '@angular/router';

// Refactored routes with Lazy Loading enabled

/**
 * Configuración de rutas principales de la aplicación.
 * Organizado por áreas: Pública, Usuario y Administración.
 */
export const routes: Routes = [
  // --- Área Pública ---
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'SNEAKER_LAB | Home'
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
    title: 'SNEAKER_LAB | Catalog'
  },

  // --- Área de Usuario ---
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
    title: 'SNEAKER_LAB | Shopping Cart'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth.component'),
    title: 'SNEAKER_LAB | Login'
  },

  // --- Área Administrativa ---
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
    title: 'Admin | Products Management'
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    title: 'Admin | User Management'
  },

  // --- Redirección por defecto ---
  { path: '**', redirectTo: '' }
];
