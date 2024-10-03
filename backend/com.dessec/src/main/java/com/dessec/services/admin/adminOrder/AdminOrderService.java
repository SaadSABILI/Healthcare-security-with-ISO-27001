package com.dessec.services.admin.adminOrder;

import com.dessec.dto.AnalyticsResponse;
import com.dessec.dto.OrderDto;

import java.util.List;

public interface AdminOrderService {

    List<OrderDto> getAllPlacedOrders();

    OrderDto changeOrderStatus(Long orderId, String status);

    AnalyticsResponse calculateAnalytics();
}
