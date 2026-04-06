package distribution.demo.Services;

import distribution.demo.Dtos.MerchantDto;
import distribution.demo.Entities.Merchant;
import distribution.demo.Repositories.MerchantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MerchantService {

    private final MerchantRepository merchantRepository;

    public MerchantService(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    public List<Merchant> getAllMerchants() {
        return merchantRepository.findByActiveTrue();
    }

    public Merchant getMerchantById(Long id) {
        return merchantRepository.findById(id)
                .filter(Merchant::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Merchant not found with id: " + id));
    }

    public Merchant getMerchantByEmail(String email) {
        return merchantRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new EntityNotFoundException("Merchant not found with email: " + email));
    }

    public Merchant createMerchant(MerchantDto dto) {
        if (merchantRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Merchant with email '" + dto.getEmail() + "' already exists");
        }
        Merchant merchant = mapToEntity(new Merchant(), dto);
        return merchantRepository.save(merchant);
    }

    public Merchant updateMerchant(Long id, MerchantDto dto) {
        Merchant merchant = getMerchantById(id);
        if (!merchant.getEmail().equals(dto.getEmail()) && merchantRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Merchant with email '" + dto.getEmail() + "' already exists");
        }
        mapToEntity(merchant, dto);
        return merchantRepository.save(merchant);
    }

    public void deleteMerchant(Long id) {
        Merchant merchant = getMerchantById(id);
        merchant.setActive(false);
        merchantRepository.save(merchant);
    }

    private Merchant mapToEntity(Merchant merchant, MerchantDto dto) {
        merchant.setStoreName(dto.getStoreName());
        merchant.setContactPerson(dto.getContactPerson());
        merchant.setEmail(dto.getEmail());
        merchant.setPhoneNumber(dto.getPhoneNumber());
        merchant.setAddress(dto.getAddress());
        merchant.setTaxId(dto.getTaxId());
        merchant.setWebsiteUrl(dto.getWebsiteUrl());
        merchant.setCommissionRate(dto.getCommissionRate());
        return merchant;
    }
}
