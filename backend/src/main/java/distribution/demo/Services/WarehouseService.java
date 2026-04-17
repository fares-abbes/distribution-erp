package distribution.demo.Services;

import distribution.demo.Dtos.WarehouseDto;
import distribution.demo.Entities.Warehouse;
import distribution.demo.Repositories.WarehouseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findByActiveTrue();
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + id));
    }

    public Warehouse createWarehouse(WarehouseDto dto) {
        if (warehouseRepository.existsByNameAndCity(dto.getName(), dto.getCity())) {
            throw new IllegalArgumentException(
                    "Warehouse '" + dto.getName() + "' already exists in " + dto.getCity());
        }
        Warehouse warehouse = new Warehouse();
        warehouse.setName(dto.getName());
        warehouse.setCity(dto.getCity());
        warehouse.setAddress(dto.getAddress());
        warehouse.setActive(dto.isActive());
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(Long id, WarehouseDto dto) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setName(dto.getName());
        warehouse.setCity(dto.getCity());
        warehouse.setAddress(dto.getAddress());
        warehouse.setActive(dto.isActive());
        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(Long id) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);
    }
}
