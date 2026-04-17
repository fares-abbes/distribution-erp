package distribution.demo.Repositories;

import distribution.demo.Entities.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    List<Warehouse> findByActiveTrue();

    Optional<Warehouse> findByIdAndActiveTrue(Long id);

    boolean existsByNameAndCity(String name, String city);
}
