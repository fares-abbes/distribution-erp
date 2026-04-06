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
public class ZoneDto {
    @NotBlank
    private String name;

    @NotBlank
    private String cityOrRegion;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal baseDeliveryFee;

    @Min(0)
    private Integer estimatedDaysMin;

    @Min(0)
    private Integer estimatedDaysMax;
}
