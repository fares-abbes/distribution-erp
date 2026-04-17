package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import distribution.demo.Enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    private String email;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // Keycloak user UUID — kept in sync with Keycloak
    private String keycloakId;

    // Optional: link to Merchant record (for MERCHANT role)
    @Getter(onMethod_ = {@JsonIgnore})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_record_id")
    private Merchant merchantRecord;

    // Optional: link to Rider record (for RIDER role)
    @Getter(onMethod_ = {@JsonIgnore})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_record_id")
    private Rider riderRecord;

    private boolean active = true;

    @Transient
    public Long getMerchantRecordId() {
        return merchantRecord != null ? merchantRecord.getId() : null;
    }

    @Transient
    public Long getRiderRecordId() {
        return riderRecord != null ? riderRecord.getId() : null;
    }
}
