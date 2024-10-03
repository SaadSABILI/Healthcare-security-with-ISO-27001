import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss'
})
export class PlaceOrderComponent {

  orderForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private customerService: CustomerService,
    private router: Router,
    public dialog: MatDialog
  ){}

  ngOnInit(){
    this.orderForm = this.fb.group({
      address: [null, [Validators.required]],
      orderDescription: [null],
    })
  }

  placeOrder() {
    this.customerService.placeOrder(this.orderForm.value).subscribe({
      next: (res) => {
        if (res && res.id != null) {
          this.snackBar.open("Order placed successfully", "Close", { duration: 5000 });
          this.router.navigateByUrl("/customer/my-orders");
          this.closeForm();
        } else {
          this.snackBar.open("Something went wrong. Please try again.", "Close", { duration: 5000 });
        }
      },
      error: (err) => {
        let errorMessage = 'An unexpected error occurred while placing your order. Please try again.';
        
        // Handle if `err.error` is a string or has a message field
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        }
  
        console.error('Error placing order:', err);  // Log the full error for debugging purposes
        this.snackBar.open(errorMessage, "Close", { duration: 5000 });
      }
    });
  }
  
  

  closeForm(){
    this.dialog.closeAll();
  }

}
