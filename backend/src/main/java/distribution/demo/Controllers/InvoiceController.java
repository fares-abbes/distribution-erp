package distribution.demo.Controllers;

import distribution.demo.Dtos.InvoiceGenerateDto;
import distribution.demo.Entities.Invoice;
import distribution.demo.Enums.InvoiceStatus;
import distribution.demo.Services.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Invoice> generateInvoice(@Valid @RequestBody InvoiceGenerateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.generateInvoice(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MERCHANT')")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/merchant/{merchantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MERCHANT')")
    public ResponseEntity<List<Invoice>> getInvoicesByMerchant(@PathVariable Long merchantId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByMerchant(merchantId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestParam InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, status));
    }
}
