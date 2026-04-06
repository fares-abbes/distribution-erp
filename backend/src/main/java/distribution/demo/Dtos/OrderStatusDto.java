package distribution.demo.Dtos;

import distribution.demo.Enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderStatusDto {
    @NotNull
    private OrderStatus status;
}
