package distribution.demo.Services;

import distribution.demo.Dtos.PaymentDto;
import distribution.demo.Entities.Merchant;
import distribution.demo.Entities.Order;
import distribution.demo.Entities.Payment;
import distribution.demo.Repositories.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> getPaymentsByMerchant(Long merchantId) {
        return paymentRepository.findByMerchant_Id(merchantId);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found with id: " + id));
    }

    public Payment createPayment(PaymentDto dto) {
        Payment payment = new Payment();
        payment.setAmount(dto.getAmount());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setMethod(dto.getMethod());
        payment.setReference(dto.getReference());
        payment.setNotes(dto.getNotes());
        payment.setStatus(dto.getStatus());

        Merchant merchant = new Merchant();
        merchant.setId(dto.getMerchantId());
        payment.setMerchant(merchant);

        if (dto.getOrderId() != null) {
            Order order = new Order();
            order.setId(dto.getOrderId());
            payment.setOrder(order);
        }

        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatus(Long id, PaymentDto dto) {
        Payment payment = getPaymentById(id);
        payment.setStatus(dto.getStatus());
        if (dto.getReference() != null) {
            payment.setReference(dto.getReference());
        }
        if (dto.getNotes() != null) {
            payment.setNotes(dto.getNotes());
        }
        return paymentRepository.save(payment);
    }
}
