package distribution.demo.Entities;

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

    // Optional: If this user is a Merchant, link it to their merchant record
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_record_id")
    private Merchant merchantRecord;

    private boolean active = true;
}
