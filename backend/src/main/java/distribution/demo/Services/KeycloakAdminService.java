package distribution.demo.Services;

import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-client-id}")
    private String adminClientId;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;

    private Keycloak buildClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .clientId(adminClientId)
                .username(adminUsername)
                .password(adminPassword)
                .build();
    }

    /**
     * Creates a user in Keycloak, sets their password, and assigns their realm role.
     * Returns the Keycloak user UUID.
     */
    public String createUser(String username, String email, String fullName, String password, String roleName) {
        try (Keycloak kc = buildClient()) {
            RealmResource realmResource = kc.realm(realm);

            // Build user representation
            UserRepresentation user = new UserRepresentation();
            user.setUsername(username);
            user.setEmail(email);
            user.setEnabled(true);
            user.setEmailVerified(true);
            String[] parts = fullName != null ? fullName.split(" ", 2) : new String[]{"", ""};
            user.setFirstName(parts[0]);
            user.setLastName(parts.length > 1 ? parts[1] : "");

            Response response = realmResource.users().create(user);
            int status = response.getStatus();
            if (status != 201) {
                String body = response.hasEntity() ? response.readEntity(String.class) : "no body";
                throw new RuntimeException("Keycloak user creation failed (" + status + "): " + body);
            }

            // Extract the new user's UUID from the Location header
            String locationPath = response.getLocation().getPath();
            String keycloakId = locationPath.substring(locationPath.lastIndexOf('/') + 1);

            UserResource userResource = realmResource.users().get(keycloakId);

            // Set password
            setPassword(userResource, password);

            // Assign realm role
            assignRole(realmResource, userResource, roleName);

            return keycloakId;
        }
    }

    /**
     * Updates a Keycloak user's password. Call only when a new password is provided.
     */
    public void updatePassword(String keycloakId, String newPassword) {
        try (Keycloak kc = buildClient()) {
            UserResource userResource = kc.realm(realm).users().get(keycloakId);
            setPassword(userResource, newPassword);
        }
    }

    /**
     * Disables a Keycloak user (soft-delete equivalent).
     */
    public void disableUser(String keycloakId) {
        try (Keycloak kc = buildClient()) {
            UserResource userResource = kc.realm(realm).users().get(keycloakId);
            UserRepresentation rep = userResource.toRepresentation();
            rep.setEnabled(false);
            userResource.update(rep);
        }
    }

    private void setPassword(UserResource userResource, String password) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        userResource.resetPassword(credential);
    }

    private void assignRole(RealmResource realmResource, UserResource userResource, String roleName) {
        try {
            RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
            userResource.roles().realmLevel().add(List.of(role));
        } catch (Exception e) {
            // Role may not exist in Keycloak realm — log and continue
            System.err.println("Warning: could not assign role '" + roleName + "' in Keycloak: " + e.getMessage());
        }
    }
}
