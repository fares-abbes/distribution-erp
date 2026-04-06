package distribution.demo.Repositories;

import distribution.demo.Entities.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    List<Merchant> findByActiveTrue();
    Optional<Merchant> findByEmailAndActiveTrue(String email);
    boolean existsByEmail(String email);
}
