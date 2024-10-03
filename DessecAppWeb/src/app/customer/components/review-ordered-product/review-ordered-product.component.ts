import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStorageService } from '../../../services/storage/user-storage.service';

@Component({
  selector: 'app-review-ordered-product',
  templateUrl: './review-ordered-product.component.html',
  styleUrls: ['./review-ordered-product.component.scss'] // Fixed 'styleUrl' to 'styleUrls'
})
export class ReviewOrderedProductComponent {

  productId!: number; // Declare the variable without initializing it here
  reviewForm!: FormGroup;
  selectedFile: File | null = null; // Initialize selectedFile as null
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private customerService: CustomerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Initialize productId in ngOnInit
    this.productId = this.activatedRoute.snapshot.params["productId"];

    this.reviewForm = this.fb.group({
      rating: [null, [Validators.required]],
      description: [null, [Validators.required]],
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.previewImage();
  }

  previewImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submitForm() {
    const formData: FormData = new FormData();
    if (this.selectedFile) {
      formData.append('img', this.selectedFile);
    }
    formData.append('productId', this.productId.toString());
    formData.append('userId', UserStorageService.getUserId().toString());
    formData.append('rating', this.reviewForm.get('rating').value);
    formData.append('description', this.reviewForm.get('description').value);
  
    this.customerService.giveReview(formData).subscribe({
      next: (res) => {
        if (res.id != null) {
          this.snackBar.open('Review posted successfully', 'Close', {
            duration: 5000
          });
          this.router.navigateByUrl('/customer/my_orders');
        } else {
          this.snackBar.open("Something went wrong", 'ERROR', {
            duration: 5000
          });
        }
      },
      error: (err) => {
        console.error('Error:', err);  // Log the full error for debugging
        this.snackBar.open("Server error. Please try again later.", 'ERROR', {
          duration: 5000
        });
      }
    });
  }
  
}
