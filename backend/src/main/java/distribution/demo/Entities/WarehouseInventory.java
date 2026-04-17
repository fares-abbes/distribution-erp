package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "warehouse_inventory",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_product_warehouse",
        columnNames = {"product_id", "warehouse_id"}
    )
)
public class WarehouseInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @Getter(onMethod_ = {@JsonIgnore})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @Getter(onMethod_ = {@JsonIgnore})
    private Warehouse warehouse;

    @Column(nullable = false)
    private Integer quantity = 0;

    private LocalDateTime lastUpdated;

    @Transient
    @JsonProperty("productId")
    public Long getProductId() {
        return product != null ? product.getId() : null;
    }

    @Transient
    @JsonProperty("warehouseId")
    public Long getWarehouseId() {
        return warehouse != null ? warehouse.getId() : null;
    }
}
