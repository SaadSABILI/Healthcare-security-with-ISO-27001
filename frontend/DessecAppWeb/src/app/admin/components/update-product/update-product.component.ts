import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss']  // Fixed typo styleUrls
})
export class UpdateProductComponent {

  productId!: number; // Declare without initialization
  productForm: FormGroup;
  listOfCategories: any = [];
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  existingImage: string | null = null;
  imgChanged = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private activatedroute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize productId in ngOnInit
    this.productId = this.activatedroute.snapshot.params['productId'];

    this.productForm = this.fb.group({
      categoryId: [null, [Validators.required]],
      name: [null, [Validators.required]],
      price: [null, [Validators.required]],
      description: [null, [Validators.required]],
    });

    this.getAllCategories();
    this.getProductById();
  }

  getAllCategories() {
    this.adminService.getAllCategories().subscribe({
      next: res => {
        this.listOfCategories = res;
      },
      error: error => {
        this.snackBar.open('Failed to load categories. Please try again later.', 'Close', {
          duration: 5000,
        });
      },
      complete: () => {
        console.log('Categories fetched successfully');
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.previewImage();
    this.imgChanged = true;

    this.existingImage = null;
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

  getProductById() {
    this.adminService.getProductById(this.productId).subscribe(res => {
      this.productForm.patchValue(res);
      this.existingImage = 'data:image/jpeg;base64,' + res.byteImg;
    });
  }
/*
  updateProduct(): void {
    if (this.productForm.valid) {
      const formData: FormData = new FormData();
      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }
      formData.append('categoryId', this.productForm.get('categoryId')?.value);
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);

      this.adminService.addProduct(formData).subscribe({
        next: res => {
          if (res.id != null) {
            this.snackBar.open('Product posted successfully!', 'Close', {
              duration: 5000,
            });
            this.router.navigateByUrl('/admin/dashboard');
          } else {
            this.snackBar.open(res.message, 'ERROR', {
              duration: 5000,
            });
          }
        },
        error: error => {
          this.snackBar.open('Failed to post product. Please try again later.', 'Close', {
            duration: 5000,
          });
        },
        complete: () => {
          console.log('Product posting process completed');
        }
      });
    } else {
      for (const i in this.productForm.controls) {
        if (this.productForm.controls.hasOwnProperty(i)) {
          this.productForm.controls[i].markAsDirty();
          this.productForm.controls[i].updateValueAndValidity();
        }
      }
    }
  }*/

    updateProduct(): void {
      if(this.productForm.valid){
        const formData: FormData = new FormData();

        if(this.imgChanged && this.selectedFile){
          formData.append('img', this.selectedFile);
        }
        formData.append('categoryId', this.productForm.get('categoryId').value);
        formData.append('name', this.productForm.get('name').value);
        formData.append('description', this.productForm.get('description').value);
        formData.append('price', this.productForm.get('price').value);

        this.adminService.updateProduct(this.productId, formData).subscribe((res) =>{
          if(res.id != null){
            this.snackBar.open('Product updated successfully','Close',{
              duration: 5000
            });
            this.router.navigateByUrl('/admin/dashboard');
          }else{
            this.snackBar.open(res.message, 'ERROR',{
              duration: 5000
            });
          }
        })
      }
      
    }
}
