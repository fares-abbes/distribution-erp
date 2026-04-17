package distribution.demo.Services;

import distribution.demo.Entities.Product;
import distribution.demo.Entities.Warehouse;
import distribution.demo.Entities.WarehouseInventory;
import distribution.demo.Exceptions.InsufficientStockException;
import distribution.demo.Repositories.ProductRepository;
import distribution.demo.Repositories.WarehouseInventoryRepository;
import distribution.demo.Repositories.WarehouseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class InventoryService {

    private final WarehouseInventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public InventoryService(WarehouseInventoryRepository inventoryRepository,
                            WarehouseRepository warehouseRepository,
                            ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    public WarehouseInventory setStock(Long productId, Long warehouseId, int quantity) {
        Product product = productRepository.findById(productId)
                .filter(Product::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findByIdAndActiveTrue(warehouseId)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));

        WarehouseInventory inventory = inventoryRepository
                .findByProduct_IdAndWarehouse_Id(productId, warehouseId)
                .orElseGet(() -> {
                    WarehouseInventory wi = new WarehouseInventory();
                    wi.setProduct(product);
                    wi.setWarehouse(warehouse);
                    return wi;
                });

        inventory.setQuantity(quantity);
        inventory.setLastUpdated(LocalDateTime.now());
        return inventoryRepository.save(inventory);
    }

    public WarehouseInventory adjustStock(Long productId, Long warehouseId, int delta) {
        WarehouseInventory inventory = inventoryRepository
                .findByProduct_IdAndWarehouse_Id(productId, warehouseId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No inventory record found for product " + productId + " in warehouse " + warehouseId));

        int newQuantity = inventory.getQuantity() + delta;
        if (newQuantity < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock in warehouse " + warehouseId + " for product " + productId +
                    ". Available: " + inventory.getQuantity() + ", Requested deduction: " + (-delta));
        }

        inventory.setQuantity(newQuantity);
        inventory.setLastUpdated(LocalDateTime.now());
        return inventoryRepository.save(inventory);
    }

    public Integer getTotalStock(Long productId) {
        return inventoryRepository.sumQuantityByProductId(productId);
    }

    public Map<Long, Integer> getAllTotalStocks() {
        Map<Long, Integer> totals = new HashMap<>();
        for (Object[] row : inventoryRepository.sumQuantityGroupedByProduct()) {
            totals.put((Long) row[0], ((Number) row[1]).intValue());
        }
        return totals;
    }

    public List<WarehouseInventory> getStockByProduct(Long productId) {
        return inventoryRepository.findByProduct_Id(productId);
    }

    public List<WarehouseInventory> getStockByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouse_Id(warehouseId);
    }

    public WarehouseInventory getStockByProductAndWarehouse(Long productId, Long warehouseId) {
        return inventoryRepository.findByProduct_IdAndWarehouse_Id(productId, warehouseId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No inventory record found for product " + productId + " in warehouse " + warehouseId));
    }

    public void deductStockForOrder(Long productId, int quantity, Long warehouseId) {
        if (warehouseId != null) {
            WarehouseInventory row = inventoryRepository
                    .findByProduct_IdAndWarehouse_Id(productId, warehouseId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No stock record for product " + productId + " in warehouse " + warehouseId));
            if (row.getQuantity() < quantity) {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
                Warehouse warehouse = row.getWarehouse();
                throw new InsufficientStockException(
                        "Insufficient stock for '" + product.getName() + "' in warehouse '" +
                        warehouse.getName() + " (" + warehouse.getCity() + ")'. " +
                        "Available: " + row.getQuantity() + ", Requested: " + quantity);
            }
            row.setQuantity(row.getQuantity() - quantity);
            row.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(row);
        } else {
            int totalStock = getTotalStock(productId);
            if (totalStock < quantity) {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
                throw new InsufficientStockException(
                        "Insufficient stock for product '" + product.getName() + "'. " +
                        "Available: " + totalStock + ", Requested: " + quantity);
            }
            List<WarehouseInventory> rows = inventoryRepository.findByProduct_Id(productId);
            rows.sort(Comparator.comparingLong(wi -> wi.getWarehouse().getId()));
            int remaining = quantity;
            for (WarehouseInventory row : rows) {
                if (remaining <= 0) break;
                int deduct = Math.min(row.getQuantity(), remaining);
                if (deduct > 0) {
                    row.setQuantity(row.getQuantity() - deduct);
                    row.setLastUpdated(LocalDateTime.now());
                    inventoryRepository.save(row);
                    remaining -= deduct;
                }
            }
        }
    }

    public void restoreStock(Long productId, int quantity) {
        List<WarehouseInventory> rows = inventoryRepository.findByProduct_Id(productId);
        if (rows.isEmpty()) {
            return;
        }
        WarehouseInventory row = rows.get(0);
        row.setQuantity(row.getQuantity() + quantity);
        row.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(row);
    }
}
