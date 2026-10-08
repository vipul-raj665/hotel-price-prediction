/**
 * Centralized API Service for Hotel Price Prediction System
 */

const BASE_URL = 'http://127.0.0.1:8000/api';

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
