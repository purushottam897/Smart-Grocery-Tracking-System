import axios from "axios";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl = envApiUrl || (import.meta.env.DEV ? "http://127.0.0.1:8082" : "");

if (!envApiUrl && !import.meta.env.DEV) {
  console.warn("VITE_API_URL is not set. Frontend requests will use the current origin.");
}

const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, "")
});

export default api;
