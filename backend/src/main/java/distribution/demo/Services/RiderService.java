package distribution.demo.Services;

import distribution.demo.Dtos.RiderDto;
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
public class RiderService {

    private final RiderRepository riderRepository;
    private final VehicleRepository vehicleRepository;

    public RiderService(RiderRepository riderRepository,
                        VehicleRepository vehicleRepository) {
        this.riderRepository = riderRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<Rider> getAllRiders() {
        return riderRepository.findByActiveTrue();
    }

    public Rider getRiderById(Long id) {
        return riderRepository.findById(id)
                .filter(Rider::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Rider not found with id: " + id));
    }

    public Rider createRider(RiderDto dto) {
        Rider rider = new Rider();
        rider.setName(dto.getName());
        rider.setPhone(dto.getPhone());
        rider.setVehicle(resolveVehicle(dto.getVehicleId()));
        return riderRepository.save(rider);
    }

    public Rider updateRider(Long id, RiderDto dto) {
        Rider rider = getRiderById(id);
        rider.setName(dto.getName());
        rider.setPhone(dto.getPhone());
        rider.setVehicle(resolveVehicle(dto.getVehicleId()));
        return riderRepository.save(rider);
    }

    public void deleteRider(Long id) {
        Rider rider = getRiderById(id);
        rider.setActive(false);
        riderRepository.save(rider);
    }

    private Vehicle resolveVehicle(Long vehicleId) {
        if (vehicleId == null) return null;
        return vehicleRepository.findById(vehicleId)
                .filter(Vehicle::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found: " + vehicleId));
    }
}
