// src/api/groupApi.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // if you're using sessions/cookies with Passport
});

export const createGroup = async (groupData) => {
  const res = await API.post('/groups', groupData);
  return res.data;
};

export const getUserGroups = async () => {
  const res = await API.get('/groups/mine');
  return res.data;
};
