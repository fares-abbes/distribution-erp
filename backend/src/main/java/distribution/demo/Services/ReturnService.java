package distribution.demo.Services;

import distribution.demo.Dtos.ReturnOrderDto;
import distribution.demo.Entities.*;
import distribution.demo.Enums.ShipmentStatus;
import distribution.demo.Repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReturnService {

    private final ReturnOrderRepository returnOrderRepository;
    private final ShipmentRepository shipmentRepository;
    private final InventoryService inventoryService;

    public ReturnService(ReturnOrderRepository returnOrderRepository,
                         ShipmentRepository shipmentRepository,
                         InventoryService inventoryService) {
        this.returnOrderRepository = returnOrderRepository;
        this.shipmentRepository = shipmentRepository;
        this.inventoryService = inventoryService;
    }

    public ReturnOrder getReturnOrderById(Long id) {
        return returnOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Return order not found with id: " + id));
    }

    public List<ReturnOrder> getReturnsByMerchant(Long merchantId) {
        return returnOrderRepository.findByMerchant_Id(merchantId);
    }

    public ReturnOrder processReturn(ReturnOrderDto dto) {
        Shipment shipment = shipmentRepository.findById(dto.getShipmentId())
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + dto.getShipmentId()));

        shipment.setCurrentStatus(ShipmentStatus.RETURNED);
        shipmentRepository.save(shipment);

        ReturnOrder returnOrder = new ReturnOrder();
        returnOrder.setReason(dto.getReason());
        returnOrder.setReturnDate(LocalDateTime.now());
        returnOrder.setRestockApproved(dto.isRestockApproved());
        returnOrder.setShipment(shipment);

        Merchant merchant = new Merchant();
        merchant.setId(dto.getMerchantId());
        returnOrder.setMerchant(merchant);

        if (dto.isRestockApproved()) {
            Order order = shipment.getOrder();
            if (order != null) {
                for (OrderItem item : order.getOrderItems()) {
                    inventoryService.restoreStock(item.getProduct().getId(), item.getQuantity());
                }
            }
        }

        return returnOrderRepository.save(returnOrder);
    }
}
