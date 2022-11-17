import axios from 'axios';

const baseURL = 'https://10.3.2.5:3000/';

const axiosConfig = axios.create({
  baseURL,
  withCredentials: true
})

axiosConfig.interceptors.response.use(
  response => { return response; },
  error => {
    axios.get('https://10.3.2.5:5001/auth/refresh', { withCredentials: true })
      .catch((error) => {
        if (error.response.data['statusCode'] == 401)
          window.open('https://10.3.2.5:3000', '_self')
      });
    return error;
  }
)

export default axiosConfig;
