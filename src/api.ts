const API_URL = 'http://localhost:5000/api';

export const register = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

export const askGemini = async (prompt: string, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/gemini`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gemini request failed');
  }

  return response.json();
};

export const saveStudyPlan = async (schedule: any[], examDate: string, goals: string, token: string) => {
  const response = await fetch(`${API_URL}/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ schedule, examDate, goals }),
  });

  if (!response.ok) {
    throw new Error('Failed to save plan');
  }

  return response.json();
};

export const getStudyPlan = async (token: string) => {
  const response = await fetch(`${API_URL}/plan`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch plan');
  }

  return response.json();
};

export const saveWellnessLog = async (data: any, token: string) => {
  const response = await fetch(`${API_URL}/wellness`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save wellness log');
  }

  return response.json();
};

export const getStats = async (token: string) => {
  const response = await fetch(`${API_URL}/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
};

export const getGaps = async (token: string) => {
  const response = await fetch(`${API_URL}/gaps`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch learning gaps');
  }

  return response.json();
};

export const saveGap = async (gap: any, token: string) => {
  const response = await fetch(`${API_URL}/gaps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(gap),
  });

  if (!response.ok) {
    throw new Error('Failed to save learning gap');
  }

  return response.json();
};

export const deleteGap = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/gaps/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete learning gap');
  }

  return response.json();
};
