package distribution.demo.Services;

import distribution.demo.Dtos.OrderDto;
import distribution.demo.Dtos.OrderItemDto;
import distribution.demo.Entities.*;
import distribution.demo.Enums.OrderPaymentMethod;
import distribution.demo.Enums.OrderStatus;
import distribution.demo.Enums.ShipmentStatus;
import distribution.demo.Exceptions.InsufficientStockException;
import distribution.demo.Repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        ShipmentRepository shipmentRepository,
                        UserRepository userRepository,
                        ZoneRepository zoneRepository,
                        WarehouseRepository warehouseRepository,
                        InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.zoneRepository = zoneRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryService = inventoryService;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByMerchant(Long merchantId) {
        return orderRepository.findByMerchant_Id(merchantId);
    }

    public List<Order> getOrdersByClient(Long clientId) {
        return orderRepository.findByClient_Id(clientId);
    }

    public Order placeOrder(OrderDto dto) {
        verifyMerchantAccess(dto.getMerchantId());

        Long warehouseId = dto.getWarehouseId();
        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + itemDto.getProductId()));
            int available = warehouseId != null
                    ? inventoryService.getStockByProductAndWarehouse(product.getId(), warehouseId).getQuantity()
                    : inventoryService.getTotalStock(product.getId());
            if (available < itemDto.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for product '" + product.getName() + "'. " +
                        "Available: " + available + ", Requested: " + itemDto.getQuantity());
            }
        }

        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.DRAFT);
        order.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : OrderPaymentMethod.PREPAID);
        order.setCodAmount(dto.getCodAmount());

        Client client = new Client();
        client.setId(dto.getClientId());
        order.setClient(client);

        Merchant merchant = new Merchant();
        merchant.setId(dto.getMerchantId());
        order.setMerchant(merchant);

        if (dto.getWarehouseId() != null) {
            warehouseRepository.findByIdAndActiveTrue(dto.getWarehouseId())
                    .ifPresent(order::setWarehouse);
        }

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId()).get();
            inventoryService.deductStockForOrder(product.getId(), itemDto.getQuantity(), warehouseId);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            BigDecimal unitPrice = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : product.getSalePrice();
            item.setUnitPrice(unitPrice);
            item.setDiscount(itemDto.getDiscount() != null ? itemDto.getDiscount() : BigDecimal.ZERO);
            item.setOrder(order);
            items.add(item);

            BigDecimal lineTotal = unitPrice
                    .subtract(item.getDiscount())
                    .multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            total = total.add(lineTotal);
        }

        order.setOrderItems(items);
        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = getOrderById(id);
        OrderStatus currentStatus = order.getStatus();
        order.setStatus(newStatus);

        if (currentStatus == OrderStatus.DRAFT && newStatus == OrderStatus.CONFIRMED) {
            createShipmentForOrder(order);
        }

        if (newStatus == OrderStatus.CANCELLED && currentStatus != OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        return orderRepository.save(order);
    }

    private void createShipmentForOrder(Order order) {
        String clientCity = null;
        try {
            clientCity = order.getClient().getCity();
        } catch (Exception ignored) {
        }

        BigDecimal baseFee = BigDecimal.valueOf(5.0);
        Zone zone = null;
        if (clientCity != null) {
            zone = zoneRepository.findByCityOrRegionIgnoreCaseAndActiveTrue(clientCity).orElse(null);
            if (zone != null) {
                baseFee = zone.getBaseDeliveryFee();
            }
        }

        double shippingCost = baseFee.doubleValue();
        for (OrderItem item : order.getOrderItems()) {
            Product p = item.getProduct();
            double weight = p.getWeight() != null ? p.getWeight() : 0.0;
            shippingCost += weight * item.getQuantity() * 0.5;
            if (p.isFragile()) {
                shippingCost += 2.0 * item.getQuantity();
            }
        }

        String deliveryAddress = null;
        try { deliveryAddress = order.getClient().getAddress(); } catch (Exception ignored) {}

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        shipment.setCurrentStatus(ShipmentStatus.READY_FOR_PICKUP);
        shipment.setPickupWarehouse(order.getWarehouse());
        shipment.setDeliveryAddress(deliveryAddress);
        shipment.setShippingCost(BigDecimal.valueOf(shippingCost));
        shipment.setOrder(order);
        shipment.setZone(zone);
        shipmentRepository.save(shipment);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            inventoryService.restoreStock(item.getProduct().getId(), item.getQuantity());
        }
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    private void verifyMerchantAccess(Long merchantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isMerchantRole = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MERCHANT"));
        if (!isMerchantRole) return;

        String username = ((Jwt) auth.getPrincipal()).getClaim("preferred_username");
        User user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found: " + username));

        if (user.getMerchantRecord() == null || !user.getMerchantRecord().getId().equals(merchantId)) {
            throw new AccessDeniedException("Merchant can only create orders for their own merchant account");
        }
    }
}
