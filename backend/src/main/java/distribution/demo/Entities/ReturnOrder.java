package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Transient;
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

    @Getter(onMethod_ = {@JsonIgnore})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Getter(onMethod_ = {@JsonIgnore})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @Transient
    public Long getShipmentId() {
        return shipment != null ? shipment.getId() : null;
    }

    @Transient
    public Long getMerchantId() {
        return merchant != null ? merchant.getId() : null;
    }
}
