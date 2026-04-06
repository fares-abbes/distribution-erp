package distribution.demo.Enums;

public enum UserRole {
    ADMIN,      // Full control over the ERP
    MANAGER,    // Manage merchants, clients, and products
    DISPATCHER, // Manage orders and delivery assignments
    RIDER,      // The person delivering the products
    MERCHANT,   // Account for the ecommerce owner to view their sales/stock
    WAREHOUSE   // For stock management and parcel preparation
}
