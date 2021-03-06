import Axios from 'axios';
import { CSRF_TOKEN } from './csrf_token.js';

async function handleResponse(response) {
  if (response.status === 204) {
    return '';
  } else if (response.status === 404) {
    return null;
  } else {
    return response.json();
  }
}

async function apiService(endpoint, method, data) {
  const config = {
    method: method || 'GET',
    body: data !== undefined ? JSON.stringify(data) : null,
    headers: {
      'content-type': 'application/json',
      'X-CSRFTOKEN': CSRF_TOKEN
    }
  };
  try {
    const response = await fetch(endpoint, config);
    return handleResponse(response);
  } catch (error) {
    return console.log(error);
  }
}

const axios = Axios.create({
  timeout: 60000,
  headers: {
    'content-type': 'application/json',
    'X-CSRFTOKEN': CSRF_TOKEN
  }
});

export { apiService, axios };
