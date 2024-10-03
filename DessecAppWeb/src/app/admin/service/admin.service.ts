import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const BASIC_URL = "http://localhost:8080/";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  // Method to add a category
  addCategory(categoryDto: any): Observable<any> {
    return this.http.post(BASIC_URL + 'api/admin/category', categoryDto);
  }

  getAllCategories(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin');  
  }

  addProduct(productDto: any): Observable<any> {
    return this.http.post(BASIC_URL + 'api/admin/product', productDto);
  }

  updateProduct(productId: any, productDto:any): Observable<any> {
    return this.http.put(BASIC_URL + `api/admin/product/${productId}`, productDto);
  }

  getAllProducts(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/products');  // Updated endpoint for fetching all categories
  }

  getProductById(productId): Observable<any> {
    return this.http.get(BASIC_URL + `api/admin/product/${productId}`);  // Updated endpoint for fetching all categories
  }

  getAllProductsByName(name:any): Observable<any> {
    return this.http.get(BASIC_URL + `api/admin/search/${name}`);  // Updated endpoint for fetching all categories
  }

  deleteProduct(productId: any): Observable<any> {
    return this.http.delete(BASIC_URL + `api/admin/product/${productId}`);
  }

  addCoupon(couponDto: any): Observable<any> {
    return this.http.post(BASIC_URL + 'api/admin/coupons', couponDto);
  }

  getCoupons(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/coupons');  // Correct endpoint for fetching coupons
  }
  
  getPlacedOrders(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/placedOrders');  // Correct endpoint for fetching placed orders
  }

  changeOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.get(BASIC_URL + `api/admin/order/${orderId}/${status}`); 
  }

  postFAQ(productId: number, faqDto: any): Observable<any> {
    return this.http.post(BASIC_URL + `api/admin/faq/${productId}`,faqDto); 
  }

  getAnalytics(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/order/analytics');  // Correct endpoint for fetching placed orders
  }


  private createAuthorizationHeader(): HttpHeaders {
    return new HttpHeaders().set(
      'Authorization', 'Bearer ' + localStorage.getItem('token') // or UserStorageService.getToken()
    );
  }
  
  
}
