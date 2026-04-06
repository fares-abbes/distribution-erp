package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import distribution.demo.Enums.ReturnReason;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "return_orders")
public class ReturnOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnReason reason;

    private LocalDateTime returnDate;

    private boolean restockApproved;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    @JsonIgnore
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    @JsonIgnore
    private Merchant merchant;

    public Long getShipmentId() {
        return shipment != null ? shipment.getId() : null;
    }

    public Long getMerchantId() {
        return merchant != null ? merchant.getId() : null;
    }
}
