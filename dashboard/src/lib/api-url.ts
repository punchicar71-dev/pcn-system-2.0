/**
 * API URL Helper
 * Ensures the API URL is properly formatted with https:// prefix
 */

/**
 * Get the properly formatted API server URL
 * Handles cases where the URL might be missing the protocol prefix
 */
export function getApiServerUrl(): string {
  const envUrl = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  // If the URL already has a protocol, return as-is
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }
  
  // If it's localhost, use http
  if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
    return `http://${envUrl}`;
  }
  
  // For all other cases (like Railway URLs), use https
  return `https://${envUrl}`;
}
