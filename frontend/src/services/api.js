/**
 * Centralized API Service for Hotel Price Prediction System
 */

let apiOrigin = (import.meta.env.VITE_API_URL || '').trim();
if (apiOrigin && !apiOrigin.startsWith('http://') && !apiOrigin.startsWith('https://')) {
  apiOrigin = `https://${apiOrigin}`;
}
const BASE_URL = apiOrigin ? `${apiOrigin.replace(/\/$/, '')}/api` : '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Network response was not ok';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = `Server error: ${response.statusText} (${response.status})`;
    }
    throw new Error(errorMessage);
  }
  return await response.json();
}

export async function getHealth() {
  const response = await fetch(`${BASE_URL}/health`);
  return handleResponse(response);
}

export async function getModelInfo() {
  const response = await fetch(`${BASE_URL}/model-info`);
  return handleResponse(response);
}

export async function getMetrics() {
  const response = await fetch(`${BASE_URL}/metrics`);
  return handleResponse(response);
}

export async function getFeatureImportance() {
  const response = await fetch(`${BASE_URL}/feature-importance`);
  return handleResponse(response);
}

export async function getStatistics() {
  const response = await fetch(`${BASE_URL}/statistics`);
  return handleResponse(response);
}

export async function predictPrice(data) {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
