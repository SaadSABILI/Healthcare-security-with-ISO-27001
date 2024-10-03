import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-post-product',
  templateUrl: './post-product.component.html',
  styleUrls: ['./post-product.component.scss'] // corrected from 'styleUrl' to 'styleUrls'
})
export class PostProductComponent {

  productForm: FormGroup;
  listOfCategories: any = [];
  selectedFile: File | null = null; // Initialize selectedFile to null
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      categoryId: [null, [Validators.required]],
      name: [null, [Validators.required]],
      price: [null, [Validators.required]],
      description: [null, [Validators.required]],
    });

    // Fetch categories on component initialization
    this.getAllCategories();
  }

  // Fetch categories from the API without JWT
  getAllCategories() {
    this.adminService.getAllCategories().subscribe({
      next: res => {
        this.listOfCategories = res; // Handle the response
      },
      error: error => {
        // Handle the error case
        this.snackBar.open('Failed to load categories. Please try again later.', 'Close', {
          duration: 5000,
        });
      },
      complete: () => {
        console.log('Categories fetched successfully');
      }
    });
  }
  
  // Handle file selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // Get the selected file
    this.previewImage(); // Generate preview of the selected image
  }

  // Preview the selected image
  previewImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile); // Only read if file is selected
    }
  }

  // Submit the product form
  addProduct(): void {
    if (this.productForm.valid) {
      const formData: FormData = new FormData();
      if (this.selectedFile) {
        formData.append('img', this.selectedFile); // Attach image if available
      }
      formData.append('categoryId', this.productForm.get('categoryId')?.value);
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);

      // Call the service to add the product
      this.adminService.addProduct(formData).subscribe({
        next: res => {
          if (res.id != null) {
            // Success: Show snackbar and navigate to dashboard
            this.snackBar.open('Product posted successfully!', 'Close', {
              duration: 5000,
            });
            this.router.navigateByUrl('/admin/dashboard');
          } else {
            // Failure: Show error message
            this.snackBar.open(res.message, 'ERROR', {
              duration: 5000,
            });
          }
        },
        error: error => {
          // Handle error case
          this.snackBar.open('Failed to post product. Please try again later.', 'Close', {
            duration: 5000,
          });
        },
        complete: () => {
          console.log('Product posting process completed');
        }
      });
    } else {
      // Mark all form controls as dirty to trigger validation errors
      for (const i in this.productForm.controls) {
        if (this.productForm.controls.hasOwnProperty(i)) {
          this.productForm.controls[i].markAsDirty();
          this.productForm.controls[i].updateValueAndValidity();
        }
      }
    }
  }
}
