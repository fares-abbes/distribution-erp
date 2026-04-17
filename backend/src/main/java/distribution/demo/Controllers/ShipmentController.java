package distribution.demo.Controllers;

import distribution.demo.Dtos.RiderAssignDto;
import distribution.demo.Dtos.ShipmentStatusDto;
import distribution.demo.Entities.Shipment;
import distribution.demo.Services.ShipmentService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DISPATCHER', 'RIDER')")
    public ResponseEntity<Shipment> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DISPATCHER', 'RIDER', 'MERCHANT')")
    public ResponseEntity<Shipment> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getShipmentByTrackingNumber(trackingNumber));
    }

    @PatchMapping("/{id}/assign-rider")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<Shipment> assignRider(@PathVariable Long id, @Valid @RequestBody RiderAssignDto dto) {
        return ResponseEntity.ok(shipmentService.assignRider(id, dto.getRiderId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    public ResponseEntity<Shipment> updateShipmentStatus(@PathVariable Long id, @Valid @RequestBody ShipmentStatusDto dto) {
        return ResponseEntity.ok(shipmentService.updateShipmentStatus(id, dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DISPATCHER')")
    public ResponseEntity<List<Shipment>> getAllShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @GetMapping("/rider/{riderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DISPATCHER', 'RIDER')")
    public ResponseEntity<List<Shipment>> getShipmentsByRider(@PathVariable Long riderId) {
        return ResponseEntity.ok(shipmentService.getShipmentsByRider(riderId));
    }

    @GetMapping("/my-shipments")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<List<Shipment>> getMyShipments() {
        return ResponseEntity.ok(shipmentService.getMyShipments());
    }
}
