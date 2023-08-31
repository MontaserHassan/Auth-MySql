import { Router } from "express";
import { callbackGoogleURL, callbackKeycloakURL, callbackFacebookURL} from "../Controllers/auth.controller";


export const thirdPartyRouter = Router();

thirdPartyRouter.get("/google/callback", callbackGoogleURL);
thirdPartyRouter.get("/facebook/callback", callbackFacebookURL);
thirdPartyRouter.get("/keycloak/callback", callbackKeycloakURL);

// Logout 
//http://localhost:8080/auth/realms/test/protocol/openid-connect/logout?client_id=keycloak_node_test_app&redirect_uri=http://localhost:3001/
//http://localhost:8080/realms/test/protocol/openid-connect/logout?client_id=keycloak_node_test_app