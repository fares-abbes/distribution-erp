package distribution.demo.Dtos;

import distribution.demo.Enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserDto {

    @NotBlank
    private String username;

    // Required on create, optional on update (blank = keep existing)
    private String password;

    @NotBlank
    private String fullName;

    @Email
    private String email;

    private String phoneNumber;

    @NotNull
    private UserRole role;

    // --- RIDER role fields ---
    private Long vehicleId;

    // --- MERCHANT role fields ---
    private String storeName;
    private Double commissionRate;
    private String taxId;
    private String address;
    private String websiteUrl;
}
