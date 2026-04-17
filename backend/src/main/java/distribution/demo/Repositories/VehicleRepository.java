package distribution.demo.Repositories;

import distribution.demo.Entities.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByActiveTrue();
    Optional<Vehicle> findByPlateNumberAndActiveTrue(String plateNumber);
}
