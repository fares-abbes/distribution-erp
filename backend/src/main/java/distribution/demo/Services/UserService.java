package distribution.demo.Services;

import distribution.demo.Dtos.UserDto;
import distribution.demo.Entities.Merchant;
import distribution.demo.Entities.Rider;
import distribution.demo.Entities.User;
import distribution.demo.Entities.Vehicle;
import distribution.demo.Enums.UserRole;
import distribution.demo.Repositories.MerchantRepository;
import distribution.demo.Repositories.RiderRepository;
import distribution.demo.Repositories.UserRepository;
import distribution.demo.Repositories.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RiderRepository riderRepository;
    private final MerchantRepository merchantRepository;
    private final VehicleRepository vehicleRepository;
    private final KeycloakAdminService keycloakAdminService;

    public UserService(UserRepository userRepository,
                       RiderRepository riderRepository,
                       MerchantRepository merchantRepository,
                       VehicleRepository vehicleRepository,
                       KeycloakAdminService keycloakAdminService) {
        this.userRepository = userRepository;
        this.riderRepository = riderRepository;
        this.merchantRepository = merchantRepository;
        this.vehicleRepository = vehicleRepository;
        this.keycloakAdminService = keycloakAdminService;
    }

    public List<User> getAllUsers() {
        return userRepository.findByActiveTrue();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .filter(User::isActive)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
    }

    public User createUser(UserDto dto) {
        enforceRoleCreationPolicy(dto.getRole());

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username '" + dto.getUsername() + "' is already taken");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required when creating a new user");
        }
        if (dto.getRole() == UserRole.MERCHANT && (dto.getStoreName() == null || dto.getStoreName().isBlank())) {
            throw new IllegalArgumentException("Store name is required for MERCHANT users");
        }

        // 1. Provision in Keycloak
        String keycloakId;
        try {
            keycloakId = keycloakAdminService.createUser(
                    dto.getUsername(),
                    dto.getEmail(),
                    dto.getFullName(),
                    dto.getPassword(),
                    dto.getRole().name()
            );
        } catch (Exception e) {
            throw new IllegalArgumentException(
                "Keycloak provisioning failed: " + e.getMessage() +
                ". Check: (1) Keycloak is running, (2) admin credentials in application.properties are correct, " +
                "(3) admin-cli client in master realm has Direct Access Grants enabled."
            );
        }

        // 2. Build the User entity
        User user = new User();
        user.setKeycloakId(keycloakId);
        applyCommonFields(user, dto);

        // 3. Auto-create linked business profile
        if (dto.getRole() == UserRole.RIDER) {
            Rider rider = new Rider();
            rider.setName(dto.getFullName());
            rider.setPhone(dto.getPhoneNumber() != null ? dto.getPhoneNumber() : "");
            rider.setVehicle(resolveVehicle(dto.getVehicleId()));
            riderRepository.save(rider);
            user.setRiderRecord(rider);
        } else if (dto.getRole() == UserRole.MERCHANT) {
            Merchant merchant = new Merchant();
            merchant.setStoreName(dto.getStoreName());
            merchant.setContactPerson(dto.getFullName());
            merchant.setEmail(dto.getEmail() != null ? dto.getEmail() : dto.getUsername() + "@nexflow.local");
            merchant.setPhoneNumber(dto.getPhoneNumber());
            merchant.setCommissionRate(dto.getCommissionRate());
            merchant.setTaxId(dto.getTaxId());
            merchant.setAddress(dto.getAddress());
            merchant.setWebsiteUrl(dto.getWebsiteUrl());
            merchantRepository.save(merchant);
            user.setMerchantRecord(merchant);
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, UserDto dto) {
        User user = getUserById(id);

        if (!user.getUsername().equals(dto.getUsername()) && userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username '" + dto.getUsername() + "' is already taken");
        }

        // Update Keycloak password if a new one was provided
        if (dto.getPassword() != null && !dto.getPassword().isBlank() && user.getKeycloakId() != null) {
            keycloakAdminService.updatePassword(user.getKeycloakId(), dto.getPassword());
        }

        applyCommonFields(user, dto);

        // Sync linked Rider profile
        if (user.getRiderRecord() != null) {
            Rider rider = user.getRiderRecord();
            rider.setName(dto.getFullName());
            if (dto.getPhoneNumber() != null) rider.setPhone(dto.getPhoneNumber());
            rider.setVehicle(resolveVehicle(dto.getVehicleId()));
            riderRepository.save(rider);
        }

        // Sync linked Merchant profile
        if (user.getMerchantRecord() != null) {
            Merchant merchant = user.getMerchantRecord();
            merchant.setContactPerson(dto.getFullName());
            if (dto.getPhoneNumber() != null) merchant.setPhoneNumber(dto.getPhoneNumber());
            if (dto.getStoreName() != null && !dto.getStoreName().isBlank()) merchant.setStoreName(dto.getStoreName());
            if (dto.getCommissionRate() != null) merchant.setCommissionRate(dto.getCommissionRate());
            if (dto.getTaxId() != null) merchant.setTaxId(dto.getTaxId());
            if (dto.getAddress() != null) merchant.setAddress(dto.getAddress());
            if (dto.getWebsiteUrl() != null) merchant.setWebsiteUrl(dto.getWebsiteUrl());
            merchantRepository.save(merchant);
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        user.setActive(false);

        // Cascade deactivation to linked profile
        if (user.getRiderRecord() != null) {
            user.getRiderRecord().setActive(false);
            riderRepository.save(user.getRiderRecord());
        }
        if (user.getMerchantRecord() != null) {
            user.getMerchantRecord().setActive(false);
            merchantRepository.save(user.getMerchantRecord());
        }

        // Disable in Keycloak
        if (user.getKeycloakId() != null) {
            keycloakAdminService.disableUser(user.getKeycloakId());
        }

        userRepository.save(user);
    }

    private void applyCommonFields(User user, UserDto dto) {
        user.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(dto.getPassword());
        }
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(dto.getRole());
    }

    private Vehicle resolveVehicle(Long vehicleId) {
        if (vehicleId == null) return null;
        return vehicleRepository.findById(vehicleId)
                .filter(Vehicle::isActive)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Vehicle not found: " + vehicleId));
    }

    private void enforceRoleCreationPolicy(UserRole targetRole) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
        if (isManager && (targetRole == UserRole.ADMIN || targetRole == UserRole.MANAGER)) {
            throw new AccessDeniedException("Managers cannot create ADMIN or MANAGER accounts");
        }
    }
}
