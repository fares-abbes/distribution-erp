package distribution.demo.Dtos;

import distribution.demo.Enums.OrderPaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderDto {
    @NotNull
    private Long clientId;

    @NotNull
    private Long merchantId;

    @NotNull
    @NotEmpty
    private List<OrderItemDto> items;

    private OrderPaymentMethod paymentMethod = OrderPaymentMethod.PREPAID;

    private BigDecimal codAmount;

    private Long warehouseId;
}
