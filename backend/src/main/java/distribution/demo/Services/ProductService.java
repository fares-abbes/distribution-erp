package distribution.demo.Services;

import distribution.demo.Dtos.ProductDto;
import distribution.demo.Entities.Merchant;
import distribution.demo.Entities.Product;
import distribution.demo.Repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    public Product getProductBySku(String sku) {
        return productRepository.findBySkuAndActiveTrue(sku)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with SKU: " + sku));
    }

    public List<Product> getProductsByMerchant(Long merchantId) {
        return productRepository.findByMerchant_IdAndActiveTrue(merchantId);
    }

    public Product createProduct(ProductDto dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + dto.getSku() + "' already exists");
        }
        Product product = mapToEntity(new Product(), dto);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductDto dto) {
        Product product = getProductById(id);
        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + dto.getSku() + "' already exists");
        }
        mapToEntity(product, dto);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product mapToEntity(Product product, ProductDto dto) {
        product.setSku(dto.getSku());
        product.setBarcode(dto.getBarcode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setType(dto.getType());
        product.setPurchasePrice(dto.getPurchasePrice());
        product.setSalePrice(dto.getSalePrice());
        product.setWeight(dto.getWeight());
        product.setVolume(dto.getVolume());
        product.setDimensions(dto.getDimensions());
        product.setStockQuantity(dto.getStockQuantity());
        product.setMinStockLevel(dto.getMinStockLevel());
        product.setDeclaredValue(dto.getDeclaredValue());
        product.setFragile(dto.isFragile());
        if (dto.getMerchantId() != null) {
            Merchant merchant = new Merchant();
            merchant.setId(dto.getMerchantId());
            product.setMerchant(merchant);
        }
        return product;
    }
}
