package distribution.demo.Controllers;

import distribution.demo.Dtos.WarehouseInventoryDto;
import distribution.demo.Entities.WarehouseInventory;
import distribution.demo.Services.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/totals")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'MERCHANT')")
    public ResponseEntity<Map<Long, Integer>> getAllTotalStocks() {
        return ResponseEntity.ok(inventoryService.getAllTotalStocks());
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'MERCHANT')")
    public ResponseEntity<List<WarehouseInventory>> getStockByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStockByProduct(productId));
    }

    @GetMapping("/product/{productId}/total")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'MERCHANT')")
    public ResponseEntity<Integer> getTotalStock(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getTotalStock(productId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    public ResponseEntity<List<WarehouseInventory>> getStockByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getStockByWarehouse(warehouseId));
    }

    @GetMapping("/product/{productId}/warehouse/{warehouseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    public ResponseEntity<WarehouseInventory> getStockByProductAndWarehouse(
            @PathVariable Long productId,
            @PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getStockByProductAndWarehouse(productId, warehouseId));
    }

    @PostMapping("/set")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    public ResponseEntity<WarehouseInventory> setStock(@Valid @RequestBody WarehouseInventoryDto dto) {
        return ResponseEntity.ok(inventoryService.setStock(dto.getProductId(), dto.getWarehouseId(), dto.getQuantity()));
    }

    @PatchMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    public ResponseEntity<WarehouseInventory> adjustStock(@Valid @RequestBody WarehouseInventoryDto dto) {
        if (dto.getDelta() == null) {
            throw new IllegalArgumentException("delta field is required for stock adjustment");
        }
        return ResponseEntity.ok(inventoryService.adjustStock(dto.getProductId(), dto.getWarehouseId(), dto.getDelta()));
    }
}
