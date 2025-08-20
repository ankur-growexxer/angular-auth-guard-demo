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
    this.productService.getAll().subscribe(data => this.products = data);
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
    if (!this.searchText.trim()) {
      return this.products;
    }

    const lowerSearch = this.searchText.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.price.toString().includes(lowerSearch)
    );
  }
}
