package distribution.demo.Dtos;

import distribution.demo.Enums.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShipmentStatusDto {
    @NotNull
    private ShipmentStatus status;

    private String statusDescription;
}
