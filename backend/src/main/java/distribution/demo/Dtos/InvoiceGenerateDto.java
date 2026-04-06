package distribution.demo.Dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceGenerateDto {
    @NotNull
    private Long merchantId;

    @NotNull
    private LocalDate fromDate;

    @NotNull
    private LocalDate toDate;
}
