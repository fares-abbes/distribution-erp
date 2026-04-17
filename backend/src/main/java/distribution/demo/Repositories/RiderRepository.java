package distribution.demo.Repositories;

import distribution.demo.Entities.Rider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiderRepository extends JpaRepository<Rider, Long> {
    List<Rider> findByActiveTrue();
    List<Rider> findByVehicle_IdAndActiveTrue(Long vehicleId);
}
