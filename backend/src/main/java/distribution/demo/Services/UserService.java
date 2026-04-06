package distribution.demo.Services;

import distribution.demo.Dtos.UserDto;
import distribution.demo.Entities.Merchant;
import distribution.demo.Entities.User;
import distribution.demo.Repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("User with username '" + dto.getUsername() + "' already exists");
        }
        User user = mapToEntity(new User(), dto);
        return userRepository.save(user);
    }

    public User updateUser(Long id, UserDto dto) {
        User user = getUserById(id);
        if (!user.getUsername().equals(dto.getUsername()) && userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("User with username '" + dto.getUsername() + "' already exists");
        }
        mapToEntity(user, dto);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    private User mapToEntity(User user, UserDto dto) {
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(dto.getRole());
        if (dto.getMerchantRecordId() != null) {
            Merchant merchant = new Merchant();
            merchant.setId(dto.getMerchantRecordId());
            user.setMerchantRecord(merchant);
        }
        return user;
    }
}
