const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function checkRefreshToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const newAccessToken = response.headers.get("x-access-token");
      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking refresh token:", error);
    return false;
  }
}
