package com.dessec.services.admin.coupon;

import com.dessec.entity.Coupon;

import java.util.List;

public interface AdminCouponService {

    Coupon createCoupon(Coupon coupon);
    List<Coupon> getAllCoupons();
}
