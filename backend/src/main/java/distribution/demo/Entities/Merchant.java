package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "merchants")
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String storeName;

    private String contactPerson;

    @Column(unique = true, nullable = false)
    private String email;

    private String phoneNumber;

    private String address;

    private String taxId; // Registration number or Tax ID

    private String websiteUrl;

    // Financial Relationship
    private Double commissionRate; // % per delivery or sale

    // Relationship with Products
    @Getter(onMethod_ = {@JsonIgnore})
    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL)
    private List<Product> products;

    // Relationship with Clients
    @Getter(onMethod_ = {@JsonIgnore})
    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL)
    private List<Client> clients;

    private boolean active = true;
}
