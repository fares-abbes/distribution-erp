package distribution.demo.Services;

import distribution.demo.Dtos.ZoneDto;
import distribution.demo.Entities.Zone;
import distribution.demo.Repositories.ZoneRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public ZoneService(ZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    public List<Zone> getAllZones() {
        return zoneRepository.findByActiveTrue();
    }

    public Zone getZoneById(Long id) {
        return zoneRepository.findById(id)
                .filter(Zone::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + id));
    }

    public Zone createZone(ZoneDto dto) {
        Zone zone = mapToEntity(new Zone(), dto);
        return zoneRepository.save(zone);
    }

    public Zone updateZone(Long id, ZoneDto dto) {
        Zone zone = getZoneById(id);
        mapToEntity(zone, dto);
        return zoneRepository.save(zone);
    }

    public void deleteZone(Long id) {
        Zone zone = getZoneById(id);
        zone.setActive(false);
        zoneRepository.save(zone);
    }

    private Zone mapToEntity(Zone zone, ZoneDto dto) {
        zone.setName(dto.getName());
        zone.setCityOrRegion(dto.getCityOrRegion());
        zone.setBaseDeliveryFee(dto.getBaseDeliveryFee());
        zone.setEstimatedDaysMin(dto.getEstimatedDaysMin());
        zone.setEstimatedDaysMax(dto.getEstimatedDaysMax());
        return zone;
    }
}
