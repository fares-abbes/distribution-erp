package distribution.demo.Repositories;

import distribution.demo.Entities.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatusLogRepository extends JpaRepository<StatusLog, Long> {
}
