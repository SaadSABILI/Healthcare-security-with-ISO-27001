package com.dessec.services.customer.cart;

import com.dessec.dto.AddProductInCartDto;
import com.dessec.dto.CartItemsDto;
import com.dessec.dto.OrderDto;
import com.dessec.dto.PlaceOrderDto;
import com.dessec.entity.*;
import com.dessec.enums.OrderStatus;
import com.dessec.exceptions.ValidationException;
import com.dessec.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemsRepository cartItemsRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Override
    public ResponseEntity<?> addProductToCart(AddProductInCartDto addProductInCartDto) {
        // Find or create active order
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(addProductInCartDto.getUserId(), OrderStatus.Pending);

        if (activeOrder == null) {
            activeOrder = new Order();
            Optional<User> optionalUser = userRepository.findById(addProductInCartDto.getUserId());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            activeOrder.setUser(optionalUser.get());
            activeOrder.setOrderStatus(OrderStatus.Pending);
            activeOrder.setTotalAmount((long) 0.0);  // Use double for amounts
            activeOrder.setAmount((long) 0.0);
            activeOrder.setCartItems(new ArrayList<>());
            activeOrder = orderRepository.save(activeOrder);
        }

        Optional<CartItems> optionalCartItems = cartItemsRepository.findByProductIdAndOrderIdAndUserId(
                addProductInCartDto.getProductId(), activeOrder.getId(), addProductInCartDto.getUserId()
        );

        if (optionalCartItems.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Product already in cart");
        } else {
            Optional<Product> optionalProduct = productRepository.findById(addProductInCartDto.getProductId());
            if (optionalProduct.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
            }

            CartItems cart = new CartItems();
            cart.setProduct(optionalProduct.get());
            cart.setPrice(optionalProduct.get().getPrice());
            cart.setQuantity(1L);
            cart.setUser(activeOrder.getUser());
            cart.setOrder(activeOrder);

            CartItems updatedCart = cartItemsRepository.save(cart);

            activeOrder.setTotalAmount(activeOrder.getTotalAmount() + cart.getPrice());
            activeOrder.setAmount(activeOrder.getAmount() + cart.getPrice());
            activeOrder.getCartItems().add(cart);

            orderRepository.save(activeOrder);

            // Send a success message along with 201 status
            return ResponseEntity.status(HttpStatus.CREATED).body("Product added to cart successfully");
        }
    }

    @Override
    public OrderDto getCartByUserId(Long userId) {
        // Retrieve the active order for the user
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(userId, OrderStatus.Pending);

        // If no active order exists, return an empty cart or initialize a new order
        if (activeOrder == null) {
            throw new ValidationException("No active order found for the user.");
        }

        // Retrieve and map cart items
        List<CartItemsDto> cartItemsDtosList = activeOrder.getCartItems()
                .stream().map(CartItems::getCartDto).collect(Collectors.toList());

        // Map order details to OrderDto
        OrderDto orderDto = new OrderDto();
        orderDto.setAmount(activeOrder.getAmount());
        orderDto.setId(activeOrder.getId());
        orderDto.setOrderStatus(activeOrder.getOrderStatus());
        orderDto.setDiscount(activeOrder.getDiscount());
        orderDto.setTotalAmount(activeOrder.getTotalAmount());
        orderDto.setCartItems(cartItemsDtosList);

        if (activeOrder.getCoupon() != null) {
            orderDto.setCouponName(activeOrder.getCoupon().getName());
        }

        return orderDto;
    }

    @Override
    public OrderDto placeOrder(PlaceOrderDto placeOrderDto) {
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(placeOrderDto.getUserId(), OrderStatus.Pending);
        Optional<User> optionalUser = userRepository.findById(placeOrderDto.getUserId());

        if (optionalUser.isPresent() && activeOrder != null) {
            // Set order details for placing the order
            activeOrder.setOrderDescription(placeOrderDto.getOrderDescription());
            activeOrder.setAddress(placeOrderDto.getAddress());
            activeOrder.setDate(new Date());
            activeOrder.setOrderStatus(OrderStatus.Placed);

            // Ensure a unique trackingId is generated
            activeOrder.setTrackingId(UUID.randomUUID());

            // Save the placed order
            orderRepository.save(activeOrder);

            // Create a new order for future transactions
            Order newOrder = new Order();
            newOrder.setAmount(0L);
            newOrder.setTotalAmount(0L);
            newOrder.setDiscount(0L);
            newOrder.setUser(optionalUser.get());
            newOrder.setOrderStatus(OrderStatus.Pending);

            // Ensure a unique trackingId for the new order
            newOrder.setTrackingId(UUID.randomUUID());

            orderRepository.save(newOrder);

            return activeOrder.getOrderDto();
        }

        throw new ValidationException("No active order found for this user or user does not exist.");
    }




    public OrderDto applyCoupon(Long userId, String code){
        Order activeOrder = orderRepository.findByUserIdAndOrderStatus(userId, OrderStatus.Pending);
        Coupon coupon = couponRepository.findByCode(code).orElseThrow(()
                ->new ValidationException("Coupon not found"));

        if (couponIsExpired(coupon)){
            throw new ValidationException("Coupon has expired.");
        }
        double discountAmount = ((coupon.getDiscount() / 100.0) * activeOrder.getTotalAmount());
        double netAmount = activeOrder.getTotalAmount() - discountAmount;

        activeOrder.setAmount((long)netAmount);
        activeOrder.setDiscount((long)discountAmount);
        activeOrder.setCoupon(coupon);

        orderRepository.save(activeOrder);
        return activeOrder.getOrderDto();
    }

    private boolean couponIsExpired(Coupon coupon){
        Date currentdate = new Date();
        Date expirationDate = coupon.getExpirationDate();

        return expirationDate != null && currentdate.after(expirationDate);
    }

    public OrderDto increaseProductQuantity(AddProductInCartDto addProductInCartDto){
        Order activeOrder = orderRepository.
                findByUserIdAndOrderStatus(addProductInCartDto.getUserId(), OrderStatus.Pending);
        Optional<Product> optionalProduct = productRepository.
                findById(addProductInCartDto.getProductId());

        Optional<CartItems> optionalCartItem = cartItemsRepository.
                findByProductIdAndOrderIdAndUserId(addProductInCartDto.getProductId(),
                        activeOrder.getId(), addProductInCartDto.getUserId());

        if(optionalProduct.isPresent() && optionalCartItem.isPresent()){
            CartItems cartItem = optionalCartItem.get();
            Product product = optionalProduct.get();

            activeOrder.setAmount(activeOrder.getAmount() + product.getPrice());
            activeOrder.setTotalAmount(activeOrder.getTotalAmount() + product.getPrice());

            cartItem.setQuantity(cartItem.getQuantity() + 1);

            if(activeOrder.getCoupon() != null){
                double discountAmount = ((activeOrder.getCoupon().getDiscount() / 100.0)
                        * activeOrder.getTotalAmount());
                double netAmount = activeOrder.getTotalAmount() - discountAmount;

                activeOrder.setAmount((long)netAmount);
                activeOrder.setDiscount((long)discountAmount);
            }

            cartItemsRepository.save(cartItem);
            orderRepository.save(activeOrder);
            return activeOrder.getOrderDto();
        }
        return null;
    }

    public OrderDto decreaseProductQuantity(AddProductInCartDto addProductInCartDto){
        Order activeOrder = orderRepository.
                findByUserIdAndOrderStatus(addProductInCartDto.getUserId(), OrderStatus.Pending);
        Optional<Product> optionalProduct = productRepository.
                findById(addProductInCartDto.getProductId());

        Optional<CartItems> optionalCartItem = cartItemsRepository.
                findByProductIdAndOrderIdAndUserId(addProductInCartDto.getProductId(),
                        activeOrder.getId(), addProductInCartDto.getUserId());

        if(optionalProduct.isPresent() && optionalCartItem.isPresent()){
            CartItems cartItem = optionalCartItem.get();
            Product product = optionalProduct.get();

            activeOrder.setAmount(activeOrder.getAmount() - product.getPrice());
            activeOrder.setTotalAmount(activeOrder.getTotalAmount() - product.getPrice());

            cartItem.setQuantity(cartItem.getQuantity() - 1);

            if(activeOrder.getCoupon() != null){
                double discountAmount = ((activeOrder.getCoupon().getDiscount() / 100.0)
                        * activeOrder.getTotalAmount());
                double netAmount = activeOrder.getTotalAmount() - discountAmount;

                activeOrder.setAmount((long)netAmount);
                activeOrder.setDiscount((long)discountAmount);
            }

            cartItemsRepository.save(cartItem);
            orderRepository.save(activeOrder);
            return activeOrder.getOrderDto();
        }
        return null;
    }

    public List<OrderDto> getMyPlacedOrders(Long userId){
        return orderRepository.findByUserIdAndOrderStatusIn(userId, List.of(OrderStatus.Placed,
                OrderStatus.Delivered)).stream().map(Order::getOrderDto).collect(Collectors.toList());

    }

    public OrderDto searchOrderByTrackingId(UUID trackingId){
        Optional<Order> optionalOrder = orderRepository.findByTrackingId(trackingId);
        if(optionalOrder.isPresent()){
            return optionalOrder.get().getOrderDto();
        }
        return null;
    }

}
