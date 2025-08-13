import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product';

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

  @ViewChild('productForm') productForm!: NgForm;

  constructor(
    public auth: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll().subscribe(data => this.products = data);
  }

  addProduct() {
    if (!this.newProduct.name.trim() || !this.newProduct.price || +this.newProduct.price <= 0) {
      return;
    }

    this.productService.create(this.newProduct).subscribe(() => {
      this.newProduct = { name: '', price: '' };

      if (this.productForm) {
        this.productForm.resetForm();
      }

      this.loadProducts();
    });
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
