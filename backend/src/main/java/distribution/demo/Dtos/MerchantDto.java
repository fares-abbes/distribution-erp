package distribution.demo.Dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MerchantDto {
    @NotBlank
    private String storeName;

    private String contactPerson;

    @NotBlank
    @Email
    private String email;

    private String phoneNumber;
    private String address;
    private String taxId;
    private String websiteUrl;
    private Double commissionRate;
}
