import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const request = async (method, path, data, options = {}) => {
  try {
    const response = await api.request({ method, url: path, data, ...options });

    return response;
  } catch (error) {
    throw new Error(
      `${method.toUpperCase()} request to ${path} failed: ${error}`
    );
  }
};
