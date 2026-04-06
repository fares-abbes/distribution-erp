package distribution.demo.Dtos;

import distribution.demo.Enums.ReturnReason;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReturnOrderDto {
    @NotNull
    private Long shipmentId;

    @NotNull
    private Long merchantId;

    @NotNull
    private ReturnReason reason;

    private boolean restockApproved;
}
