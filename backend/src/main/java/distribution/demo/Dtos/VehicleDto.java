package distribution.demo.Dtos;

import distribution.demo.Enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VehicleDto {

    @NotBlank
    private String plateNumber;

    @NotNull
    private VehicleType type;

    private String brand;
    private String model;
    private Integer year;
}
