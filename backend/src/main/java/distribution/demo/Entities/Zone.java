package distribution.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "zones")
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String cityOrRegion;

    @Column(nullable = false)
    private BigDecimal baseDeliveryFee;

    private Integer estimatedDaysMin;

    private Integer estimatedDaysMax;

    private boolean active = true;

    @ManyToMany
    @JoinTable(
            name = "zone_riders",
            joinColumns = @JoinColumn(name = "zone_id"),
            inverseJoinColumns = @JoinColumn(name = "rider_id")
    )
    @JsonIgnore
    private List<Rider> riders;
}
