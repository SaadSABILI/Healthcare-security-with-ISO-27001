import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-post-product-faq',
  templateUrl: './post-product-faq.component.html',
  styleUrls: ['./post-product-faq.component.scss'] // Fixed styleUrl typo
})
export class PostProductFaqComponent {

  productId!: number;  // Declare it without initialization
  FAQForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute  // Injected service
  ){}

  ngOnInit() {
    // Initialize productId in ngOnInit, after the component is initialized
    this.productId = this.activatedRoute.snapshot.params["productId"];

    // Initialize the form
    this.FAQForm = this.fb.group({
      question: [null, [Validators.required]],
      answer: [null, [Validators.required]],
    });
  }

  postFAQ() {
    if (this.FAQForm.valid) {
      this.adminService.postFAQ(this.productId, this.FAQForm.value).subscribe(res => {
        if (res.id != null) {
          this.snackBar.open('FAQ posted successfully', 'Close', { duration: 5000 });
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          this.snackBar.open("Something went wrong", "Close", { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    } else {
      this.snackBar.open("Please fill out the form properly.", "Close", { duration: 5000, panelClass: 'error-snackbar' });
    }
  }
  
}
