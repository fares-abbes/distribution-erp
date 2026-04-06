package distribution.demo.Services;

import distribution.demo.Dtos.ClientDto;
import distribution.demo.Entities.Client;
import distribution.demo.Entities.Merchant;
import distribution.demo.Repositories.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getAllClients() {
        return clientRepository.findByActiveTrue();
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .filter(Client::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + id));
    }

    public List<Client> getClientsByMerchant(Long merchantId) {
        return clientRepository.findByMerchant_IdAndActiveTrue(merchantId);
    }

    public Client createClient(ClientDto dto) {
        Client client = mapToEntity(new Client(), dto);
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, ClientDto dto) {
        Client client = getClientById(id);
        mapToEntity(client, dto);
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        Client client = getClientById(id);
        client.setActive(false);
        clientRepository.save(client);
    }

    private Client mapToEntity(Client client, ClientDto dto) {
        client.setFullName(dto.getFullName());
        client.setPhoneNumber(dto.getPhoneNumber());
        client.setEmail(dto.getEmail());
        client.setAddress(dto.getAddress());
        client.setCity(dto.getCity());
        client.setLandmark(dto.getLandmark());
        if (dto.getMerchantId() != null) {
            Merchant merchant = new Merchant();
            merchant.setId(dto.getMerchantId());
            client.setMerchant(merchant);
        }
        return client;
    }
}
