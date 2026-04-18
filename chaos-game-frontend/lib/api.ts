import axios from 'axios'

const API_BASE = 'http://localhost:5000'

export async function startSession() {
  const response = await axios.post(`${API_BASE}/api/session/start`)
  return response.data as { sessionId: string; score: number; tasksCompleted: number }
}

export async function getSession(sessionId: string) {
  const response = await axios.get(`${API_BASE}/api/session/${sessionId}`)
  return response.data as { score: number; tasksCompleted: number }
}

export async function getTask(difficulty: string, sessionId?: string) {
  const response = await axios.post(`${API_BASE}/api/task`, { difficulty, sessionId })
  return response.data as { task: string; taskLabel: string; difficulty: string }
}

export async function verifyTask(image: File, taskLabel: string, taskText: string) {
  const formData = new FormData()
  formData.append('image', image)
  formData.append('taskLabel', taskLabel)
  formData.append('taskText', taskText)
  
  const response = await axios.post(`${API_BASE}/api/verify`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  // Backend returns: { passed, topLabel, confidence, mediaType, judgment }
  return response.data as { 
    passed: boolean; 
    mediaType: string; 
    confidence: number;
    judgment: string;
  }
}

export async function postReward(sessionId: string, taskText: string, passed: boolean, difficulty: string) {
  const response = await axios.post(`${API_BASE}/api/reward`, {
    sessionId,
    taskText,
    passed,
    difficulty
  })
  
  // Backend returns: { passed, pointsEarned, totalScore, judgment, unlockedRewards, allRewards }
  return response.data as {
    passed: boolean;
    pointsEarned: number;
    totalScore: number;
    judgment: string;
    unlockedRewards: any[];
    allRewards: any[];
  }
}

export async function getStats(sessionId: string) {
  const response = await axios.get(`${API_BASE}/api/session/${sessionId}/stats`)
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
