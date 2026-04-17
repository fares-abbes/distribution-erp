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
@Table(name = "riders")
public class Rider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private boolean active = true;

    @Transient
    public Long getVehicleId() {
        return vehicle != null ? vehicle.getId() : null;
    }

    @Getter(onMethod_ = {@JsonIgnore})
    @OneToMany(mappedBy = "rider")
    private List<Shipment> shipments;
}
