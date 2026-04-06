package distribution.demo.Services;

import distribution.demo.Dtos.InvoiceGenerateDto;
import distribution.demo.Entities.Invoice;
import distribution.demo.Entities.Merchant;
import distribution.demo.Entities.Order;
import distribution.demo.Enums.InvoiceStatus;
import distribution.demo.Enums.OrderStatus;
import distribution.demo.Repositories.InvoiceRepository;
import distribution.demo.Repositories.MerchantRepository;
import distribution.demo.Repositories.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final MerchantRepository merchantRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          OrderRepository orderRepository,
                          MerchantRepository merchantRepository) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.merchantRepository = merchantRepository;
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }

    public List<Invoice> getInvoicesByMerchant(Long merchantId) {
        return invoiceRepository.findByMerchant_Id(merchantId);
    }

    public Invoice generateInvoice(InvoiceGenerateDto dto) {
        Merchant merchant = merchantRepository.findById(dto.getMerchantId())
                .filter(Merchant::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Merchant not found with id: " + dto.getMerchantId()));

        List<Order> orders = orderRepository.findByMerchant_Id(dto.getMerchantId()).stream()
                .filter(o -> o.getStatus() == OrderStatus.CONFIRMED || o.getStatus() == OrderStatus.CANCELLED)
                .filter(o -> {
                    LocalDate orderDate = o.getOrderDate().toLocalDate();
                    return !orderDate.isBefore(dto.getFromDate()) && !orderDate.isAfter(dto.getToDate());
                })
                .toList();

        BigDecimal totalAmount = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double rate = merchant.getCommissionRate() != null ? merchant.getCommissionRate() : 0.0;
        BigDecimal commissionAmount = totalAmount.multiply(BigDecimal.valueOf(rate / 100.0));

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setFromDate(dto.getFromDate());
        invoice.setToDate(dto.getToDate());
        invoice.setTotalAmount(totalAmount);
        invoice.setCommissionAmount(commissionAmount);
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setMerchant(merchant);

        return invoiceRepository.save(invoice);
    }

    public Invoice updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }
}
