import { getHeader } from "@tanstack/react-start/server";
import { Credentials, OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Make sure the environment variables are set
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET");
}

let oauthClient: OAuth2Client;

export const generateAuthUrl = async (oauthClient: OAuth2Client) => {
  return oauthClient.generateAuthUrl({
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    ],
  });
};

export const getOAuthClient = () => {
  if (!oauthClient) {
    const host = getHeader("host");

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    const redirectUri = protocol + "://" + host + "/api/auth/callback/google";

    return (oauthClient = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri,
    }));
  }

  return oauthClient;
};

export const verifyTokens = (client: OAuth2Client, tokens: Credentials) => {
  if (!tokens.id_token) {
    throw new Error("Invalid ID Token");
  }

  return client.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID,
  });
};
