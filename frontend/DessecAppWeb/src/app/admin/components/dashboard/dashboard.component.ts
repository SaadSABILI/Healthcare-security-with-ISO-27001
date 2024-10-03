import { Component } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  products: any[] = [];
  searchProductForm!: FormGroup;

  constructor(private adminService: AdminService,
      private fb: FormBuilder,
    private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.getAllProducts();
    this.searchProductForm = this.fb.group({
      title: [null, [Validators.required]]
    });
  }

  getAllProducts() {
    this.products = [];
    this.adminService.getAllProducts().subscribe(res => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.byteImg;
        this.products.push(element);
      });
      console.log(this.products);
    });
  }

  submitForm() {
    this.products = [];
    const title = this.searchProductForm.get('title')!.value;
    this.adminService.getAllProductsByName(title).subscribe(res => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.byteImg;
        this.products.push(element);
      });
      console.log(this.products);
    });
  }

  deleteProduct(productId: number): void {
    this.adminService.deleteProduct(productId).subscribe({
      next: () => {
        // Show success message
        this.snackBar.open('Product deleted successfully!', 'Close', {
          duration: 5000
        });
        this.getAllProducts();  // Reload the product list
      },
      error: (err) => {
        // Handle error and show error message
        this.snackBar.open('Error deleting product: ' + err.message, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'  // Optional class for styling error messages
        });
      }
    });
  }
  

}
