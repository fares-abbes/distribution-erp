package distribution.demo.Dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductDto {
    @NotBlank
    private String sku;

    private String barcode;

    @NotBlank
    private String name;

    private String description;
    private String type;

    @DecimalMin("0.0")
    private BigDecimal purchasePrice;

    @DecimalMin("0.0")
    private BigDecimal salePrice;

    private Double weight;
    private Double volume;
    private String dimensions;

    @Min(0)
    private Integer minStockLevel;

    private Long merchantId;
    private BigDecimal declaredValue;
    private boolean isFragile;
    private String imageUrl;
}
