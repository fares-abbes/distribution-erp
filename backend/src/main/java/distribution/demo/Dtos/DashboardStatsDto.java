package distribution.demo.Dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class DashboardStatsDto {

    // Entity counts
    private long totalMerchants;
    private long totalProducts;
    private long totalClients;
    private long totalRiders;
    private long totalOrders;

    // Revenue
    private BigDecimal totalRevenue;

    // Orders by status
    private long draftOrders;
    private long confirmedOrders;
    private long cancelledOrders;

    // Shipments by status
    private long readyForPickupShipments;
    private long pendingShipments;
    private long inTransitShipments;
    private long deliveredShipments;
    private long returnedShipments;

    // Revenue trend (last 30 days)
    private List<DailyRevenueDto> revenueLastMonth;
}
