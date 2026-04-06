package distribution.demo.Entities;

import distribution.demo.Enums.productType;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import distribution.demo.Entities.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sku;

    private String barcode;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private productType type;

    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private Double weight;
    private Double volume;
    private String dimensions;

    private Integer stockQuantity;
    private Integer minStockLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id")
    @JsonIgnore
    private Merchant merchant;

    private BigDecimal declaredValue;
    private boolean isFragile = false;
    private boolean active = true;
}
