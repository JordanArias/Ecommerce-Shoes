import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Core
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category } from '../../core/models/product.model';

/**
 * Componente de administración de productos.
 * Gestiona el inventario, permitiendo CRUD de productos y gestión de categorías.
 */
@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  // --- Inyecciones ---
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);

  // --- Estado de Datos ---
  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public loading = signal(true);
  
  // --- Estado de Modales ---
  /** Controla la visibilidad del modal de Producto */
  public showModal = signal(false);
  /** Indica si el modal está en modo edición o creación */
  public isEditing = signal(false);
  /** Controla la visibilidad del modal de Categorías */
  public showCategoryModal = signal(false);
  
  // --- Estado del Formulario de Categoría ---
  public newCatName = signal('');
  public newCatDesc = signal('');

  // --- Estado del Formulario de Producto ---
  public currentProduct = signal<Partial<Product>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen_url: '',
    estado: 'activo',
    categoria_id: '',
    destacado: false
  });

  // --- Ciclo de Vida ---
  ngOnInit(): void {
    this._loadInitialData();
  }

  // --- Operaciones de Datos ---
  /**
   * Carga inicial de productos y categorías.
   * @private
   */
  private async _loadInitialData(): Promise<void> {
    try {
      this.loading.set(true);
      const [prods, cats] = await Promise.all([
        this._productService.getAllProducts(),
        this._categoryService.getCategories()
      ]);
      this.products.set(prods);
      this.categories.set(cats);
    } catch (error) {
      console.error('Error al cargar datos administrativos:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // --- Gestión de Productos ---
  
  /**
   * Abre el modal para crear o editar un producto.
   * @param product Producto opcional a editar.
   */
  public openModal(product?: Product): void {
    if (product) {
      this.isEditing.set(true);
      this.currentProduct.set({ ...product });
    } else {
      this.isEditing.set(false);
      this.currentProduct.set({
        nombre: '',
        descripcion: '',
        precio: 0,
        imagen_url: '',
        estado: 'activo',
        categoria_id: this.categories()[0]?.id || '',
        destacado: false
      });
    }
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  /**
   * Guarda o actualiza el producto actual en la base de datos.
   */
  public async saveProduct(): Promise<void> {
    try {
      if (this.isEditing() && this.currentProduct().id) {
        await this._productService.updateProduct(this.currentProduct().id as string, this.currentProduct());
      } else {
        await this._productService.createProduct(this.currentProduct() as any);
      }
      this.closeModal();
      await this._loadInitialData();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  }

  /**
   * Elimina un producto tras confirmación.
   */
  public async deleteProduct(id: string): Promise<void> {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await this._productService.deleteProduct(id);
        await this._loadInitialData();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  }

  // --- Gestión de Categorías ---

  public openCategoryModal(): void {
    this.newCatName.set('');
    this.newCatDesc.set('');
    this.showCategoryModal.set(true);
  }

  public closeCategoryModal(): void {
    this.showCategoryModal.set(false);
  }

  /**
   * Crea una nueva categoría y actualiza la lista.
   */
  public async addCategory(): Promise<void> {
    if (!this.newCatName()) return;
    
    try {
      await this._categoryService.createCategory({
        nombre: this.newCatName(),
        descripcion: this.newCatDesc()
      });
      this.newCatName.set(''); // Resetear campo
      const cats = await this._categoryService.getCategories();
      this.categories.set(cats);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert('Error al crear la categoría');
    }
  }

  /**
   * Elimina una categoría si no está en uso.
   */
  public async deleteCategory(id: string): Promise<void> {
    if (confirm('¿Eliminar esta categoría? Los productos que la usen podrían verse afectados.')) {
      try {
        await this._categoryService.deleteCategory(id);
        const cats = await this._categoryService.getCategories();
        this.categories.set(cats);
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert('No se puede eliminar: la categoría está en uso por productos activos.');
      }
    }
  }
}
