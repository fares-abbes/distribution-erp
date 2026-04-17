package distribution.demo.Repositories;

import distribution.demo.Entities.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {

    List<WarehouseInventory> findByProduct_Id(Long productId);

    List<WarehouseInventory> findByWarehouse_Id(Long warehouseId);

    Optional<WarehouseInventory> findByProduct_IdAndWarehouse_Id(Long productId, Long warehouseId);

    @Query("SELECT COALESCE(SUM(wi.quantity), 0) FROM WarehouseInventory wi WHERE wi.product.id = :productId")
    Integer sumQuantityByProductId(@Param("productId") Long productId);

    @Query("SELECT wi.product.id, SUM(wi.quantity) FROM WarehouseInventory wi GROUP BY wi.product.id")
    List<Object[]> sumQuantityGroupedByProduct();
}
