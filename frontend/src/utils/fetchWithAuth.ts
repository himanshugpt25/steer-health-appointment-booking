const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    // Try to refresh the token
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "GET",
        credentials: "include", // This ensures cookies are sent with the request
      });

      if (response.ok) {
        // Get the new access token from the response header
        const newAccessToken = response.headers.get("x-access-token");
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          // Retry the original request with the new token
          return fetchWithAuth(endpoint, options);
        }
      }
      // No valid refresh token or no new access token, redirect to login
      localStorage.removeItem("accessToken");
      window.location.href = "/auth/login";
      return;
    } catch (error) {
      console.error("Error refreshing token:", error);
      localStorage.removeItem("accessToken");
      window.location.href = "/auth/login";
      return;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include", // This ensures cookies are sent with the request
  });

  // Check for new access token in response headers
  const newAccessToken = response.headers.get("x-access-token");
  if (newAccessToken) {
    localStorage.setItem("accessToken", newAccessToken);
  }

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("accessToken");
    window.location.href = "/auth/login";
    return;
  }

  return response;
}
