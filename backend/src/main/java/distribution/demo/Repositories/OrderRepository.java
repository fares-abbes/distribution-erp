package distribution.demo.Repositories;

import distribution.demo.Entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByMerchant_Id(Long merchantId);
    List<Order> findByClient_Id(Long clientId);
}
