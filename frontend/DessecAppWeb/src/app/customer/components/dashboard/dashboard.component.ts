import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  products: any[] = [];
  searchProductForm!: FormGroup;

  constructor(private customerService: CustomerService,
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
    this.customerService.getAllProducts().subscribe(res => {
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
    this.customerService.getAllProductsByName(title).subscribe(res => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.byteImg;
        this.products.push(element);
      });
      console.log(this.products);
    });
  }

  addToCard(id: any): void {
    this.customerService.addToCart(id).subscribe({
      next: (res) => {
        // Assume success for valid response
        this.snackBar.open("Product added to cart successfully", "Close", {
          duration: 5000,
          panelClass: 'success-snackbar'
        });
      },
      error: (err) => {
        let errorMessage = 'An unexpected error occurred';
  
        // If the error status is 201 (Created), treat it as success
        if (err.status === 201) {
          this.snackBar.open("Product added to cart successfully", "Close", {
            duration: 5000,
            panelClass: 'success-snackbar'
          });
          return; // Exit since it's handled as success
        }
  
        // Handle other error responses
        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error; // Plain string message from the backend
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message; // Structured error message
        }
  
        console.error('Error:', errorMessage);
  
        // Display the error message
        this.snackBar.open(errorMessage, "Close", {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  

}
