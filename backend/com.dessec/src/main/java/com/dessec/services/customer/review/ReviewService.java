package com.dessec.services.customer.review;

import com.dessec.dto.OrderedProductsResponseDto;
import com.dessec.dto.ReviewDto;

import java.io.IOException;

public interface ReviewService {
    OrderedProductsResponseDto getOrderedProductsDetailsByOrderId(Long orderId);

    ReviewDto giveReview(ReviewDto reviewDto) throws IOException;
}
