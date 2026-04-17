package distribution.demo.Dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WarehouseDto {

    @NotBlank
    private String name;

    @NotBlank
    private String city;

    private String address;

    private boolean active = true;
}
