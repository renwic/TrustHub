export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function logout() {
  // Clear the authentication token from localStorage
  localStorage.removeItem('authToken');
  
  // Clear any other auth-related data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('userSession');
  
  // Redirect to logout endpoint to clear server session
  window.location.href = "/api/logout";
}