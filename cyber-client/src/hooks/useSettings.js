// src/hooks/useSettings.js — for cyber client

import { useState, useEffect } from 'react';
import api from '../api/axios';

let cached = null;
let listeners = [];

const fetchSettings = () => {
  api.get('/cyber/public-settings')
    .then(res => {
      cached = res.data;
      listeners.forEach(fn => fn(cached));
    })
    .catch(() => {
      listeners.forEach(fn => fn(null));
    });
};

fetchSettings();

export const useSettings = () => {
  const [settings, setSettings] = useState(cached);

  useEffect(() => {
    if (cached) { setSettings(cached); return; }
    const listener = (data) => setSettings(data);
    listeners.push(listener);
    return () => { listeners = listeners.filter(fn => fn !== listener); };
  }, []);

  return { settings, loading: !cached };
};