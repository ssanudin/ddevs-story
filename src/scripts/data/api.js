import { API_ORIGIN } from '../config';
import ky from 'ky';

const ENDPOINTS = {
  REGISTER: `${API_ORIGIN}/register`,
  LOGIN: `${API_ORIGIN}/login`,
  STORIES: `${API_ORIGIN}/stories`,
  SUBSCRIBE: `${API_ORIGIN}/notifications/subscribe`,
};

export async function registerUser(user) {
  return await ky.post(ENDPOINTS.REGISTER, { json: user }).json();
}

export async function loginUser(user) {
  return await ky.post(ENDPOINTS.LOGIN, { json: user }).json();
}

export async function getStories({ token, page, size, location = 0 }) {
  return await ky
    .get(ENDPOINTS.STORIES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      searchParams: {
        page,
        size,
        location,
      },
    })
    .json();
}

export async function getStoryDetail(token, id) {
  return await ky
    .get(`${ENDPOINTS.STORIES}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .json();
}

export async function addStory({ story, token = '', isGuest = false }) {
  const headers = {};
  if (!isGuest) {
    headers.Authorization = `Bearer ${token}`;
  }

  return await ky
    .post(ENDPOINTS.STORIES + (isGuest ? '/guest' : ''), {
      headers,
      body: story,
    })
    .json();
}

export async function subscribePushNotification({ subscribeStatus, token, params }) {
  return await ky(ENDPOINTS.SUBSCRIBE, {
    method: subscribeStatus ? 'POST' : 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    json: params,
  }).json();
}

export function getApiUrl(endpoint) {
  return ENDPOINTS[endpoint.toUpperCase()] || API_ORIGIN;
}
