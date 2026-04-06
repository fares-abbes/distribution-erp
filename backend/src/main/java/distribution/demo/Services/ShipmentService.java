package distribution.demo.Services;

import distribution.demo.Dtos.ShipmentStatusDto;
import distribution.demo.Entities.*;
import distribution.demo.Enums.OrderPaymentMethod;
import distribution.demo.Enums.PaymentMethod;
import distribution.demo.Enums.PaymentStatus;
import distribution.demo.Enums.ShipmentStatus;
import distribution.demo.Repositories.PaymentRepository;
import distribution.demo.Repositories.RiderRepository;
import distribution.demo.Repositories.ShipmentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final RiderRepository riderRepository;
    private final PaymentRepository paymentRepository;

    public ShipmentService(ShipmentRepository shipmentRepository,
                           RiderRepository riderRepository,
                           PaymentRepository paymentRepository) {
        this.shipmentRepository = shipmentRepository;
        this.riderRepository = riderRepository;
        this.paymentRepository = paymentRepository;
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + id));
    }

    public Shipment getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with tracking number: " + trackingNumber));
    }

    public Shipment assignRider(Long shipmentId, Long riderId) {
        Shipment shipment = getShipmentById(shipmentId);
        Rider rider = riderRepository.findById(riderId)
                .filter(Rider::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Rider not found with id: " + riderId));

        shipment.setRider(rider);
        shipment.setCurrentStatus(ShipmentStatus.PENDING);

        String updatedBy = resolveCurrentUsername();
        StatusLog log = new StatusLog();
        log.setTimestamp(LocalDateTime.now());
        log.setStatusDescription("Rider " + rider.getName() + " assigned. Status: PENDING");
        log.setUpdatedBy(updatedBy);
        log.setShipment(shipment);
        shipment.getStatusLogs().add(log);

        return shipmentRepository.save(shipment);
    }

    public Shipment updateShipmentStatus(Long id, ShipmentStatusDto dto) {
        Shipment shipment = getShipmentById(id);
        shipment.setCurrentStatus(dto.getStatus());

        String updatedBy = resolveCurrentUsername();
        StatusLog log = new StatusLog();
        log.setTimestamp(LocalDateTime.now());
        log.setStatusDescription(dto.getStatusDescription() != null
                ? dto.getStatusDescription()
                : dto.getStatus().name());
        log.setUpdatedBy(updatedBy);
        log.setShipment(shipment);
        shipment.getStatusLogs().add(log);

        if (dto.getStatus() == ShipmentStatus.DELIVERED) {
            autoCreateCodPaymentIfApplicable(shipment, updatedBy);
        }

        return shipmentRepository.save(shipment);
    }

    private void autoCreateCodPaymentIfApplicable(Shipment shipment, String updatedBy) {
        Order order = shipment.getOrder();
        if (order == null || order.getPaymentMethod() != OrderPaymentMethod.COD) return;

        BigDecimal amount = order.getCodAmount() != null ? order.getCodAmount() : order.getTotalAmount();

        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setMethod(PaymentMethod.CASH);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setNotes("Auto-generated COD payment for order " + order.getOrderNumber());
        payment.setMerchant(order.getMerchant());
        payment.setOrder(order);
        paymentRepository.save(payment);
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public List<Shipment> getShipmentsByRider(Long riderId) {
        return shipmentRepository.findByRider_Id(riderId);
    }

    private String resolveCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String username = jwt.getClaim("preferred_username");
            return username != null ? username : auth.getName();
        }
        return auth != null ? auth.getName() : "system";
    }
}
