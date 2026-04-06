package distribution.demo.Dtos;

import distribution.demo.Enums.PaymentMethod;
import distribution.demo.Enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class PaymentDto {
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private PaymentMethod method;

    private String reference;

    private String notes;

    @NotNull
    private Long merchantId;

    private Long orderId;

    @NotNull
    private PaymentStatus status;
}
