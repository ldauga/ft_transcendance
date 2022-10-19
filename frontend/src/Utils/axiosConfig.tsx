import axios from 'axios';
import { Navigate } from 'react-router-dom';

const baseURL = 'http://localhost:3000/';

const axiosConfig = axios.create({
    baseURL,
    withCredentials: true
})

axiosConfig.interceptors.response.use(
  response => {console.log('interceptor response,', response); return response; },
  error => {
    axios.get('http://localhost:5001/auth/refresh')
    .catch((error) => {
      console.log('interceptor error', error)
      if (error.response.data['statusCode'] == 401) 
        window.open('http://localhost:3000', '_self')
      }
    );
   }
)

export default axiosConfig;