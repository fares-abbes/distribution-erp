package distribution.demo.Dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RiderDto {
    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String vehicleType;
}
