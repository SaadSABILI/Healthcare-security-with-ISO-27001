import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { ActivatedRoute } from '@angular/router';
import { UserStorageService } from '../../../services/storage/user-storage.service';

@Component({
  selector: 'app-view-product-detail',
  templateUrl: './view-product-detail.component.html',
  styleUrls: ['./view-product-detail.component.scss']  // Fixed typo: 'styleUrl' to 'styleUrls'
})
export class ViewProductDetailComponent {

  productId!: number;  // Declare the variable without initializing it here

  product: any;
  FAQS: any[] = [];
  reviews: any[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private customerService: CustomerService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Initialize productId in ngOnInit where ActivatedRoute is available
    this.productId = this.activatedRoute.snapshot.params["productId"];
    this.getProductDetailById();
  }

  getProductDetailById() {
    this.customerService.getProductDetailById(this.productId).subscribe(res => {
      this.product = res.productDto;
      this.product.processedImg = 'data:image/png;base64,' + res.productDto.byteImg;

      this.FAQS = res.faqDtoList;

      res.reviewDtoList.forEach(element => {
        element.processedImg = 'data:image/png;base64,' + element.returnedImg;
        this.reviews.push(element);
      });
    });
  }

  addToWishlist(){
    const wishlistDto = {
      productId : this.productId,
      userId: UserStorageService.getUserId()
    }

    this.customerService.addProductToWishlist(wishlistDto).subscribe(res =>{
      if(res.id != null){
        this.snackBar.open('product added to wishlist successfully', 'Close',{
          duration: 5000
        });
      }else{
        this.snackBar.open("Already in wishlist", 'ERROR',{
          duration: 5000
        });
      }
    })
  }

}
