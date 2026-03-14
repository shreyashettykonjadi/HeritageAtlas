import axios from "axios"
import { getUserId } from "../utils/uuid"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  config.headers["anonymous-id"] = getUserId()
  return config
})

export default api
