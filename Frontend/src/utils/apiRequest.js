import axios from "axios";
import toast from "react-hot-toast";
import { store } from "../store";
import { logout } from "../features/usersSlice";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  withCredentials: true,
});

apiRequest.interceptors.response.use(
  (response) => {
    if (response.config.method !== "get" && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    if (error.config?.skipToast) {
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    toast.error(message);

    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }

    if (error.response?.status === 401) {
      store.dispatch(logout());
    }

    return Promise.reject(error);
  },
);

export default apiRequest;
