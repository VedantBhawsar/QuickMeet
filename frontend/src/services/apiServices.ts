import axios from "axios";

const authToken = localStorage.getItem("token") || "";
const axiosApi = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    Authorization: authToken ? `Bearer ${authToken}` : "",
  },
});

export default axiosApi;
