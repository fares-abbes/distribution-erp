package distribution.demo.Dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientDto {
    @NotBlank
    private String fullName;

    @NotBlank
    private String phoneNumber;

    @Email
    private String email;

    @NotBlank
    private String address;

    private String city;
    private String landmark;

    @NotNull
    private Long merchantId;
}
