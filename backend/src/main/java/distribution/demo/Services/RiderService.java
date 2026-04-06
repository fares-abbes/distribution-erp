package distribution.demo.Services;

import distribution.demo.Dtos.RiderDto;
import distribution.demo.Entities.Rider;
import distribution.demo.Repositories.RiderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RiderService {

    private final RiderRepository riderRepository;

    public RiderService(RiderRepository riderRepository) {
        this.riderRepository = riderRepository;
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
        rider.setVehicleType(dto.getVehicleType());
        return riderRepository.save(rider);
    }

    public Rider updateRider(Long id, RiderDto dto) {
        Rider rider = getRiderById(id);
        rider.setName(dto.getName());
        rider.setPhone(dto.getPhone());
        rider.setVehicleType(dto.getVehicleType());
        return riderRepository.save(rider);
    }

    public void deleteRider(Long id) {
        Rider rider = getRiderById(id);
        rider.setActive(false);
        riderRepository.save(rider);
    }
}
