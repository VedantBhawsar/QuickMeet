import axios from "axios";

const authToken = localStorage.getItem("token") || "";
const axiosApi = axios.create({
  baseURL: "https://quickmeet-backend.onrender.com",
  headers: {
    Authorization: authToken ? `Bearer ${authToken}` : "",
  },
});

export default axiosApi;
