import axios from "axios";

console.log(import.meta.env.API_URL);

const authToken = localStorage.getItem("token") || "";
const axiosApi = axios.create({
  baseURL: "https://quickmeet-backend.onrender.com",
  headers: {
    Authorization: authToken ? `Bearer ${authToken}` : "",
  },
});

export default axiosApi;
