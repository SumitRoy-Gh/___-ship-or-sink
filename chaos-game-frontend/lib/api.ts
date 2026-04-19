import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function startSession(token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await axios.post(`${API_BASE}/api/session/start`, {}, { headers })
  return response.data as { sessionId: string; score: number; tasksCompleted: number }
}

export async function getSession(sessionId: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await axios.get(`${API_BASE}/api/session/${sessionId}`, { headers })
  return response.data as { score: number; tasksCompleted: number }
}

export async function getTask(difficulty: string, sessionId?: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await axios.post(`${API_BASE}/api/task`, { difficulty, sessionId }, { headers })
  return response.data as { task: string; taskLabel: string; difficulty: string }
}

export async function verifyTask(image: File, taskLabel: string, taskText: string, token?: string) {
  const formData = new FormData()
  formData.append('image', image)
  formData.append('taskLabel', taskLabel)
  formData.append('taskText', taskText)
  
  const headers: any = { 'Content-Type': 'multipart/form-data' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.post(`${API_BASE}/api/verify`, formData, { headers })
  
  return response.data as { 
    passed: boolean; 
    mediaType: string; 
    confidence: number;
    judgment: string;
  }
}

export async function postReward(sessionId: string, taskText: string, passed: boolean, difficulty: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await axios.post(`${API_BASE}/api/reward`, {
    sessionId,
    taskText,
    passed,
    difficulty
  }, { headers })
  
  return response.data as {
    passed: boolean;
    pointsEarned: number;
    totalScore: number;
    judgment: string;
    unlockedRewards: any[];
    allRewards: any[];
  }
}

export async function getStats(sessionId: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await axios.get(`${API_BASE}/api/session/${sessionId}/stats`, { headers })
  return response.data as {
    score: number;
    tasksCompleted: number;
    categories: Array<{ name: string; completed: number; total: number; color: string }>;
    history: number[];
    recentActivity: Array<{ type: 'approved' | 'rejected' | 'spin'; text: string; points: number; time: string }>;
  }
}

export async function getLeaderboard() {
  const response = await axios.get(`${API_BASE}/api/leaderboard`)
  return response.data as Array<{
    name: string;
    total_score: number;
    tasks_completed: number;
    session_id: string;
  }>
}
