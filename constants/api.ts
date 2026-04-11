const fallbackBase = "http://192.168.1.102:8000";
export const API_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : fallbackBase;

export const endpoints = {
  token: `${API_BASE_URL}/api/token/`,
  tokenRefresh: `${API_BASE_URL}/api/token/refresh/`,
  me: `${API_BASE_URL}/api/accounts/me/`,
  products: `${API_BASE_URL}/api/products/`,
  ordersPurchase: `${API_BASE_URL}/api/orders/purchase/`,
  ordersHistory: `${API_BASE_URL}/api/orders/history/`,
  ordersReturn: `${API_BASE_URL}/api/orders/return/`,
};
