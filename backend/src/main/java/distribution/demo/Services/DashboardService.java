package distribution.demo.Services;

import distribution.demo.Dtos.DailyRevenueDto;
import distribution.demo.Dtos.DashboardStatsDto;
import distribution.demo.Enums.OrderStatus;
import distribution.demo.Enums.ShipmentStatus;
import distribution.demo.Repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final MerchantRepository merchantRepository;
    private final ProductRepository productRepository;
    private final ClientRepository clientRepository;
    private final RiderRepository riderRepository;
    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;

    public DashboardService(MerchantRepository merchantRepository,
                            ProductRepository productRepository,
                            ClientRepository clientRepository,
                            RiderRepository riderRepository,
                            OrderRepository orderRepository,
                            ShipmentRepository shipmentRepository) {
        this.merchantRepository = merchantRepository;
        this.productRepository = productRepository;
        this.clientRepository = clientRepository;
        this.riderRepository = riderRepository;
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
    }

    public DashboardStatsDto getStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // Entity counts
        stats.setTotalMerchants(merchantRepository.count());
        stats.setTotalProducts(productRepository.count());
        stats.setTotalClients(clientRepository.count());
        stats.setTotalRiders(riderRepository.count());
        stats.setTotalOrders(orderRepository.count());

        // Revenue (sum of CONFIRMED orders)
        BigDecimal revenue = orderRepository.sumTotalAmountByStatus(OrderStatus.CONFIRMED);
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        // Orders by status
        stats.setDraftOrders(orderRepository.countByStatus(OrderStatus.DRAFT));
        stats.setConfirmedOrders(orderRepository.countByStatus(OrderStatus.CONFIRMED));
        stats.setCancelledOrders(orderRepository.countByStatus(OrderStatus.CANCELLED));

        // Shipments by status
        stats.setReadyForPickupShipments(shipmentRepository.countByCurrentStatus(ShipmentStatus.READY_FOR_PICKUP));
        stats.setPendingShipments(shipmentRepository.countByCurrentStatus(ShipmentStatus.PENDING));
        stats.setInTransitShipments(shipmentRepository.countByCurrentStatus(ShipmentStatus.IN_TRANSIT));
        stats.setDeliveredShipments(shipmentRepository.countByCurrentStatus(ShipmentStatus.DELIVERED));
        stats.setReturnedShipments(shipmentRepository.countByCurrentStatus(ShipmentStatus.RETURNED));

        // Revenue last 30 days (CONFIRMED orders grouped by date)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        var recentOrders = orderRepository.findByStatusAndOrderDateAfter(OrderStatus.CONFIRMED, thirtyDaysAgo);

        Map<LocalDate, BigDecimal> byDay = recentOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)
                ));

        List<DailyRevenueDto> revenueList = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            BigDecimal amount = byDay.getOrDefault(day, BigDecimal.ZERO);
            revenueList.add(new DailyRevenueDto(day.toString(), amount));
        }
        stats.setRevenueLastMonth(revenueList);

        return stats;
    }
}
