import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend URL
});

export default instance;
