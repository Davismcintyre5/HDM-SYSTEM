// src/hooks/useSettings.js

import { useState, useEffect } from 'react';
import api from '../api/axios';

// Settings cache
let settingsData = null;
let settingsLoading = true;
let settingsListeners = [];

const notifySettingsListeners = () => {
  settingsListeners.forEach(fn => fn(settingsData));
};

api.get('/school/settings')
  .then(res => {
    settingsData = res.data;
    settingsLoading = false;
    notifySettingsListeners();
  })
  .catch(() => {
    settingsData = null;
    settingsLoading = false;
    notifySettingsListeners();
  });

export const useSettings = () => {
  const [settings, setSettings] = useState(settingsData);

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
      return;
    }
    const listener = (data) => setSettings(data);
    settingsListeners.push(listener);
    return () => { settingsListeners = settingsListeners.filter(fn => fn !== listener); };
  }, []);

  return { settings, loading: !settingsData && settingsLoading };
};

// Portal profile cache
let portalData = null;
let portalLoading = true;
let portalListeners = [];
let portalFetched = false;

const fetchPortal = () => {
  if (portalFetched) return;
  portalFetched = true;
  api.get('/school/portal/profile')
    .then(res => {
      portalData = res.data;
      portalLoading = false;
      portalListeners.forEach(fn => fn(portalData));
    })
    .catch(() => {
      portalData = null;
      portalLoading = false;
      portalListeners.forEach(fn => fn(portalData));
    });
};

export const usePortalProfile = () => {
  const [data, setData] = useState(portalData);

  useEffect(() => {
    if (portalData) {
      setData(portalData);
      return;
    }
    fetchPortal();
    const listener = (d) => setData(d);
    portalListeners.push(listener);
    return () => { portalListeners = portalListeners.filter(fn => fn !== listener); };
  }, []);

  return { data, loading: !portalData && portalLoading };
};

export const clearPortalCache = () => {
  portalData = null;
  portalLoading = true;
  portalFetched = false;
  portalListeners = [];
};