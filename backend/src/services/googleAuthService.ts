import { OAuth2Client, TokenPayload } from "google-auth-library";
import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";

let googleClient: OAuth2Client | null = null;

function getGoogleWebClientId() {
  const clientId = env.GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId) {
    throw new AppError("Google OAuth nao configurado no backend", 503, "GOOGLE_AUTH_NOT_CONFIGURED");
  }
  return clientId;
}

function getClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client(getGoogleWebClientId());
  }
  return googleClient;
}

export async function verifyGoogleToken(idToken: string): Promise<TokenPayload> {
  try {
    const audience = getGoogleWebClientId();
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified === false) {
      throw new AppError("Token Google invalido", 401, "INVALID_GOOGLE_TOKEN");
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Token Google invalido", 401, "INVALID_GOOGLE_TOKEN");
  }
}
