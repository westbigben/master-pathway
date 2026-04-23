import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND}/api`;

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export default api;
