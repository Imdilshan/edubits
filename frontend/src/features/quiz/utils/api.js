import axios from "axios";
import { API_URL } from "../../../config/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});



api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
