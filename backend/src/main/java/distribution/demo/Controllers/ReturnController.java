package distribution.demo.Controllers;

import distribution.demo.Dtos.ReturnOrderDto;
import distribution.demo.Entities.ReturnOrder;
import distribution.demo.Services.ReturnService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ReturnOrder> processReturn(@Valid @RequestBody ReturnOrderDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(returnService.processReturn(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ReturnOrder> getReturnById(@PathVariable Long id) {
        return ResponseEntity.ok(returnService.getReturnOrderById(id));
    }

    @GetMapping("/merchant/{merchantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MERCHANT')")
    public ResponseEntity<List<ReturnOrder>> getReturnsByMerchant(@PathVariable Long merchantId) {
        return ResponseEntity.ok(returnService.getReturnsByMerchant(merchantId));
    }
}
