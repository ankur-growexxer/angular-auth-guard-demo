import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
})
export class DashboardComponent implements OnInit {
  products: any[] = [];
  newProduct = { name: '', price: '' };
  editingProduct: any = null;
  searchText: string = '';
  selectedFile!: File;
  uploadProgress: number = -1;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  @ViewChild('productForm') productForm!: NgForm;
  @ViewChild('fileInput') fileInput!: any;

  constructor(
    public auth: AuthService,
    private productService: ProductService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll().subscribe(data => {
      this.products = data;
      this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async addProduct() {
    if (!this.newProduct.name.trim() || !this.newProduct.price || +this.newProduct.price <= 0) {
      return;
    }

    const product: any = await this.productService.create(this.newProduct).toPromise();

    if (this.selectedFile) {
      await this.uploadFileInChunks(product.id);
    }

    this.newProduct = { name: '', price: '' };
    this.selectedFile = null!;
    this.uploadProgress = -1;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    if (this.productForm) {
      this.productForm.resetForm();
    }

    this.loadProducts();
  }

  async uploadFileInChunks(productId: number) {
    const chunkSize = 0.5 * 1024 * 1024;
    const totalChunks = Math.ceil(this.selectedFile.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(this.selectedFile.size, start + chunkSize);
      const chunk = this.selectedFile.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', this.selectedFile.name);
      formData.append('product_id', productId.toString());

      await this.http.post('http://localhost:8000/api/upload-chunk', formData).toPromise();

      this.uploadProgress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    }
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
  }

  updateProduct() {
    if (!this.editingProduct.name.trim() || !this.editingProduct.price || +this.editingProduct.price <= 0) {
      return;
    }

    this.productService.update(this.editingProduct.id, this.editingProduct)
      .subscribe(() => {
        this.editingProduct = null;
        this.loadProducts();
      });
  }

  deleteProduct(id: number) {
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }

  filteredProducts() {
    let filtered = this.products;

    // 🔍 Search
    if (this.searchText.trim()) {
      const lowerSearch = this.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.price.toString().includes(lowerSearch)
      );
    }

    // Reset total pages after filtering
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    // ↕ Sorting
    if (this.sortColumn) {
      filtered = filtered.sort((a, b) => {
        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];

        if (this.sortColumn === 'price') {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = valA?.toString().toLowerCase();
          valB = valB?.toString().toLowerCase();
        }

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  paginatedProducts() {
    const filtered = this.filteredProducts();
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
}
