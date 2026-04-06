package distribution.demo.Repositories;

import distribution.demo.Entities.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByActiveTrue();

    @Query("SELECT z FROM Zone z WHERE LOWER(z.cityOrRegion) = LOWER(:cityOrRegion) AND z.active = true")
    Optional<Zone> findByCityOrRegionIgnoreCaseAndActiveTrue(@Param("cityOrRegion") String cityOrRegion);
}
