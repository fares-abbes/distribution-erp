package distribution.demo.Repositories;

import distribution.demo.Entities.Shipment;
import distribution.demo.Enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    List<Shipment> findByRider_Id(Long riderId);

    long countByCurrentStatus(ShipmentStatus status);
}
