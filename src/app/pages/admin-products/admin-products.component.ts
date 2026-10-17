import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Core
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category } from '../../core/models/product.model';
import { SupabaseService } from '../../core/services/supabase.service';

/**
 * Componente de administración de productos.
 * Gestiona el inventario, permitiendo CRUD de productos y gestión de categorías.
 */
@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  // --- Inyecciones ---
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _supabase = inject(SupabaseService);

  // --- Estado de Datos ---
  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public loading = signal(true);

  // --- Estado de Filtros ---
  public searchFilter = signal('');
  public categoryFilter = signal('');

  /**
   * Signal computado que filtra los productos según el nombre buscado y la categoría seleccionada.
   */
  public filteredProducts = computed(() => {
    let result = this.products();
    const query = this.searchFilter().toLowerCase().trim();
    const catId = this.categoryFilter();

    if (query) {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query))
      );
    }

    if (catId) {
      result = result.filter(p => p.categoria_id === catId);
    }

    return result;
  });

  /**
   * Restablece los filtros de búsqueda y categoría.
   */
  public resetFilters(): void {
    this.searchFilter.set('');
    this.categoryFilter.set('');
  }

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
  public uploadingSecondary = signal(false);
  public currentProduct = signal<Partial<Product>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen_url: '',
    imagenes: [],
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
      this.currentProduct.set({ 
        ...product,
        imagenes: product.imagenes && Array.isArray(product.imagenes) ? [...product.imagenes] : []
      });
    } else {
      this.isEditing.set(false);
      this.currentProduct.set({
        nombre: '',
        descripcion: '',
        precio: 0,
        imagen_url: '',
        imagenes: [],
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
      console.log('Iniciando saveProduct...');
      if (this.isEditing() && this.currentProduct().id) {
        // Obtener el producto antiguo para comparar la imagen
        const oldProduct = this.products().find(p => String(p.id) === String(this.currentProduct().id));
        console.log('Producto antiguo encontrado:', oldProduct);
        console.log('URL de imagen antigua:', oldProduct?.imagen_url);
        console.log('URL de imagen nueva:', this.currentProduct().imagen_url);

        await this._productService.updateProduct(this.currentProduct().id as string, this.currentProduct());

        // Si la imagen cambió, eliminamos la anterior del storage
        if (oldProduct && oldProduct.imagen_url && oldProduct.imagen_url !== this.currentProduct().imagen_url) {
          console.log('La imagen cambió. Solicitando eliminación de:', oldProduct.imagen_url);
          try {
            await this._productService.deleteProductImage(oldProduct.imagen_url);
            console.log('Imagen antigua eliminada con éxito de Supabase.');
          } catch (e: any) {
            alert('El producto se actualizó, pero hubo un error al borrar la imagen anterior de Supabase:\n' + e.message);
          }
        }
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
        console.log('Iniciando eliminación del producto con ID:', id);
        const productToDelete = this.products().find(p => String(p.id) === String(id));
        console.log('Producto a eliminar encontrado:', productToDelete);

        await this._productService.deleteProduct(id);

        // Eliminar la imagen principal del storage si el producto tenía una
        if (productToDelete && productToDelete.imagen_url) {
          console.log('El producto tiene imagen principal. Solicitando eliminación de:', productToDelete.imagen_url);
          try {
            await this._productService.deleteProductImage(productToDelete.imagen_url);
            console.log('Imagen principal eliminada con éxito de Supabase.');
          } catch (e: any) {
            console.warn('Error al borrar imagen principal de Supabase:', e);
          }
        }

        // Eliminar las imágenes secundarias de storage
        if (productToDelete && productToDelete.imagenes?.length) {
          for (const url of productToDelete.imagenes) {
            try {
              await this._productService.deleteProductImage(url);
            } catch (e) {
              console.warn('Error al borrar imagen secundaria de Supabase:', e);
            }
          }
        }

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

  /**
   * AGREGAR UNA IMAGEN A SUPABASE.
   */
  public async onImageSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    try {

      const imageUrl =
        await this._productService.uploadProductImage(file);

      this.currentProduct.update(product => ({
        ...product,
        imagen_url: imageUrl
      }));

      console.log('URL guardada:', imageUrl);

    } catch (error) {
      console.error('Error subiendo imagen:', error);
    }
  }

  /**
   * Sube múltiples imágenes secundarias a Supabase Storage y las agrega al array del producto.
   */
  public async onSecondaryImagesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    try {
      this.uploadingSecondary.set(true);
      const uploadedUrls = await this._productService.uploadMultipleProductImages(files);

      this.currentProduct.update(product => ({
        ...product,
        imagenes: [...(product.imagenes || []), ...uploadedUrls]
      }));

      // Limpiar input
      input.value = '';
    } catch (error) {
      console.error('Error subiendo imágenes secundarias:', error);
      alert('Hubo un error al subir las imágenes adicionales.');
    } finally {
      this.uploadingSecondary.set(false);
    }
  }

  /**
   * Elimina una imagen secundaria de la galería del producto actual y de Supabase Storage.
   */
  public async removeSecondaryImage(index: number): Promise<void> {
    const currentImgs = this.currentProduct().imagenes || [];
    const imgUrlToRemove = currentImgs[index];

    const updatedImgs = currentImgs.filter((_, i) => i !== index);
    this.currentProduct.update(p => ({
      ...p,
      imagenes: updatedImgs
    }));

    if (imgUrlToRemove) {
      try {
        await this._productService.deleteProductImage(imgUrlToRemove);
        console.log('Imagen secundaria eliminada de Storage:', imgUrlToRemove);
      } catch (err) {
        console.warn('No se pudo borrar del bucket la imagen secundaria:', err);
      }
    }
  }
}
