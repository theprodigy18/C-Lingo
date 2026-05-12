export type OAuthProvider = "google" | "github";

export function getOAuthUrl(provider: OAuthProvider) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  return `${baseUrl}/auth/${provider}`;
}
