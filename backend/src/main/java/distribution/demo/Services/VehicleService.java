package distribution.demo.Services;

import distribution.demo.Dtos.VehicleDto;
import distribution.demo.Entities.Rider;
import distribution.demo.Entities.Vehicle;
import distribution.demo.Repositories.RiderRepository;
import distribution.demo.Repositories.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final RiderRepository riderRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          RiderRepository riderRepository) {
        this.vehicleRepository = vehicleRepository;
        this.riderRepository = riderRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findByActiveTrue();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .filter(Vehicle::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found: " + id));
    }

    public Vehicle createVehicle(VehicleDto dto) {
        vehicleRepository.findByPlateNumberAndActiveTrue(dto.getPlateNumber())
                .ifPresent(v -> { throw new IllegalArgumentException(
                        "Plate number '" + dto.getPlateNumber() + "' is already registered"); });
        return vehicleRepository.save(mapToEntity(new Vehicle(), dto));
    }

    public Vehicle updateVehicle(Long id, VehicleDto dto) {
        Vehicle vehicle = getVehicleById(id);
        vehicleRepository.findByPlateNumberAndActiveTrue(dto.getPlateNumber())
                .filter(v -> !v.getId().equals(id))
                .ifPresent(v -> { throw new IllegalArgumentException(
                        "Plate number '" + dto.getPlateNumber() + "' is already registered"); });
        return vehicleRepository.save(mapToEntity(vehicle, dto));
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        // Unassign this vehicle from all riders before soft-deleting
        List<Rider> assignedRiders = riderRepository.findByVehicle_IdAndActiveTrue(id);
        for (Rider rider : assignedRiders) {
            rider.setVehicle(null);
            riderRepository.save(rider);
        }
        vehicle.setActive(false);
        vehicleRepository.save(vehicle);
    }

    private Vehicle mapToEntity(Vehicle v, VehicleDto dto) {
        v.setPlateNumber(dto.getPlateNumber());
        v.setType(dto.getType());
        v.setBrand(dto.getBrand());
        v.setModel(dto.getModel());
        v.setYear(dto.getYear());
        return v;
    }
}
