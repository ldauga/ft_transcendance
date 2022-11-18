import axios from 'axios';

const baseURL = 'https://localhost:3000/';

const axiosConfig = axios.create({
  baseURL,
  withCredentials: true
})

axiosConfig.interceptors.response.use(
  response => { return response; },
  error => {
    axios.get('https://localhost:5001/auth/refresh', { withCredentials: true })
      .catch((error) => {
        if (error.response.data['statusCode'] == 401)
          window.open('https://localhost:3000', '_self')
      });
    return error;
  }
)

export default axiosConfig;
