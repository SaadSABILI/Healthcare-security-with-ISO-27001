import { Component } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PlaceOrderComponent } from '../place-order/place-order.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {

  cartItems: any[] = [];
  order: any;
  couponForm!: FormGroup;

  constructor(
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.couponForm = this.fb.group({
      code: [null, [Validators.required]]
    });
    this.getCart();
  }

  applyCoupon() {
    this.customerService.applyCoupon(this.couponForm.get(['code'])!.value).subscribe({
      next: (res) => {
        this.snackBar.open("Coupon applied successfully", 'Close', { duration: 5000 });
        this.getCart();
      },
      error: (err) => this.handleError(err, "An error occurred while applying the coupon.")
    });
  }

  getCart() {
    this.cartItems = [];
    this.customerService.getCartByUserId().subscribe(res => {
      this.order = res;
      res.cartItems.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
        this.cartItems.push(element); 
      });
    }, err => this.handleError(err, "An error occurred while fetching the cart."));
  }

  increaseQuantity(productId: any) {
    this.customerService.increaseProductQuantity(productId).subscribe(res => {
      this.snackBar.open('Product quantity increased.', 'Close', { duration: 5000 });
      this.getCart();
    }, err => this.handleError(err, "An error occurred while increasing the product quantity."));
  }

  decreaseQuantity(productId: any) {
    this.customerService.decreaseProductQuantity(productId).subscribe(res => {
      this.snackBar.open('Product quantity decreased.', 'Close', { duration: 5000 });
      this.getCart();
    }, err => this.handleError(err, "An error occurred while decreasing the product quantity."));
  }

  placeOrder() {
    this.dialog.open(PlaceOrderComponent);
  }

  addToCart(productId: any) {
    this.customerService.addToCart(productId).subscribe({
      next: (res) => {
        this.snackBar.open("Product added to cart successfully", "Close", { duration: 5000 });
        this.getCart();
      },
      error: (err) => {
        console.error('Error Details:', err);  // Log the full error object for debugging
        
        let errorMessage = 'An unexpected error occurred while adding the product to the cart. Please try again.';
        
        // Handle specific status codes and provide a custom message
        if (err.status === 400) {
          errorMessage = "Bad Request. Please check your input.";
        } else if (err.status === 403) {
          errorMessage = "You are not authorized to perform this action.";
        } else if (err.status === 409) {
          errorMessage = "Product already in the cart.";
        } else if (err.status === 500) {
          errorMessage = "Internal Server Error. Please try again later.";
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;  // If backend sends a plain string as the error
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;  // If backend sends an object with a message field
        }
  
        this.snackBar.open(errorMessage, "Close", { duration: 5000 });
      }
    });
  }
  

  handleError(err: any, defaultMessage: string) {
    let errorMessage = defaultMessage;
    
    // Handle specific status codes
    if (err.status === 400) {
      errorMessage = "Bad Request. Please check your input.";
    } else if (err.status === 403) {
      errorMessage = "You are not authorized to perform this action.";
    } else if (err.status === 409) {
      errorMessage = "Product already in the cart.";
    } else if (err.status === 500) {
      errorMessage = "Internal Server Error. Please try again later.";
    } else if (err.error && typeof err.error === 'string') {
      errorMessage = err.error;  // Use error message from backend if available
    } else if (err.error && err.error.message) {
      errorMessage = err.error.message;  // Structured error message from backend
    }

    this.snackBar.open(errorMessage, "Close", { duration: 5000, panelClass: 'error-snackbar' });
  }
}
