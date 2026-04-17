package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Transient;
import distribution.demo.Enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus currentStatus;

    @Getter(onMethod_ = {@JsonIgnore})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pickup_warehouse_id")
    private Warehouse pickupWarehouse;

    private String deliveryAddress;

    private BigDecimal shippingCost;

    @Getter(onMethod_ = {@JsonIgnore})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Getter(onMethod_ = {@JsonIgnore})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @Getter(onMethod_ = {@JsonIgnore})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id")
    private Rider rider;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("shipment-logs")
    private List<StatusLog> statusLogs = new ArrayList<>();

    @Transient
    @JsonProperty("pickupWarehouseId")
    public Long getPickupWarehouseId() {
        return pickupWarehouse != null ? pickupWarehouse.getId() : null;
    }

    @Transient
    @JsonProperty("pickupWarehouseName")
    public String getPickupWarehouseName() {
        return pickupWarehouse != null ? pickupWarehouse.getName() + " — " + pickupWarehouse.getCity() : null;
    }

    @Transient
    public Long getOrderId() {
        return order != null ? order.getId() : null;
    }

    @Transient
    @JsonProperty("zoneId")
    public Long getZoneId() {
        return zone != null ? zone.getId() : null;
    }

    @Transient
    @JsonProperty("riderId")
    public Long getRiderId() {
        return rider != null ? rider.getId() : null;
    }

    @Transient
    @JsonProperty("riderName")
    public String getRiderName() {
        return rider != null ? rider.getName() : null;
    }
}
