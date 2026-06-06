import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface User {
  id: string;
  nickname: string;
  password: string;
  email: string;
  phone: string;
  signature: string;
  avatar: string;
  background: string;
  is_admin?: boolean;
  create_time?: string;
}

export interface Task {
  id: number;
  content: string;
  is_completed: boolean;
  date: string;
  create_time: string;
}

export interface Friend {
  id: string;
  nickname: string;
  email: string;
  phone: string;
  signature: string;
  avatar: string;
  background: string;
}

export interface FriendRequest {
  id: number;
  user_id: string;
  email: string;
  phone: string;
  signature: string;
  avatar: string;
  apply_time: string;
}

export interface LikeUser {
  user_id: string;
  username: string;
}

export interface Diary {
  id: number;
  user_id: string;
  username: string;
  avatar: string;
  content: string;
  images: string[];
  create_time: string;
  likes: number;
  likes_list: LikeUser[];
  comments: Comment[];
  is_own: boolean;
}

export interface Comment {
  id: number;
  user_id: string;
  username: string;
  avatar: string;
  content: string;
  create_time: string;
}

export interface Stats {
  total_users: number;
  today_active: number;
  total_completed_tasks: number;
  today_completed: number;
}

export interface UserStats {
  today_completed: number;
  today_total: number;
  today_rate: number;
  avg_rate: number;
  friend_count: number;
  total_tasks: number;
}

export interface TrendData {
  dates: string[];
  counts: number[];
}

export interface UserTrendData {
  dates: string[];
  user_names: Record<string, string>;
  trend_data: Record<string, number[]>;
}

export interface LoginResponse {
  code: number;
  msg: string;
  data: User | null;
}

export interface ResponseData<T = null> {
  code: number;
  msg: string;
  data: T;
}

export const authAPI = {
  login: (id: string, password: string) =>
    api.post<ResponseData<User>>('/login', { id, password }),

  register: (phone: string, email: string, password: string, confirm_password: string, nickname?: string) =>
    api.post<ResponseData<{ user_id: string }>>('/register', { phone, email, password, confirm_password, nickname: nickname || "" }),

  forgetPassword: (phone: string, email: string) =>
    api.post<ResponseData<{ password: string }>>('/forget_password', { phone, email }),

  getUser: (userId: string) =>
    api.get<ResponseData<User>>(`/user/${userId}`),

  updateUser: (userId: string, data: Partial<User>) =>
    api.put<ResponseData>(`/user/${userId}`, data),

  uploadAvatar: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ResponseData<User>>(`/upload/avatar?user_id=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadBackground: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ResponseData<User>>(`/upload/background?user_id=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const adminAPI = {
  getStats: () =>
    api.get<ResponseData<Stats>>('/admin/stats'),

  getUserTrend: (days: number) =>
    api.get<ResponseData<TrendData>>(`/admin/user_trend?days=${days}`),

  getTaskTrend: (days: number) =>
    api.get<ResponseData<TrendData>>(`/admin/task_trend?days=${days}`),

  getUsers: (page: number, size: number) =>
    api.get<ResponseData<{ users: User[]; total: number; page: number; size: number }>>(`/admin/users?page=${page}&size=${size}`),

  updateUser: (userId: string, data: { nickname?: string; phone?: string; email?: string }) =>
    api.put<ResponseData>(`/admin/users/${userId}`, data),

  deleteUser: (userId: string) =>
    api.delete<ResponseData>(`/admin/users/${userId}`),
};

export const userAPI = {
  getTasks: (userId: string, date?: string) =>
    api.get<ResponseData<Task[]>>(`/user/tasks?user_id=${userId}${date ? `&task_date=${date}` : ''}`),

  createTask: (userId: string, content: string, date: string) =>
    api.post<ResponseData>('/user/tasks', { user_id: userId, content, date }),

  updateTask: (taskId: number, data: Partial<Task>) =>
    api.put<ResponseData>(`/user/tasks/${taskId}`, data),

  deleteTask: (taskId: number) =>
    api.delete<ResponseData>(`/user/tasks/${taskId}`),

  getFriends: (userId: string) =>
    api.get<ResponseData<Friend[]>>(`/user/friends?user_id=${userId}`),

  getFriendRequests: (userId: string) =>
    api.get<ResponseData<FriendRequest[]>>(`/user/friend_requests?user_id=${userId}`),

  sendFriendRequest: (userId: string, friendId: string) =>
    api.post<ResponseData>('/user/friend_request', { user_id: userId, friend_id: friendId }),

  acceptFriendRequest: (requestId: number) =>
    api.put<ResponseData>(`/user/friend_request/${requestId}`),

  searchUser: (userId: string) =>
    api.get<ResponseData<User>>(`/user/search_user?user_id=${userId}`),

  getDiaries: (userId: string) =>
    api.get<ResponseData<Diary[]>>(`/user/diaries?user_id=${userId}`),

  createDiary: (userId: string, content: string, images?: string[]) =>
    api.post<ResponseData>('/user/diaries', { user_id: userId, content, images }),

  updateDiary: (diaryId: number, content: string, images?: string[]) =>
    api.put<ResponseData>(`/user/diaries/${diaryId}`, { content, images }),

  deleteDiary: (diaryId: number) =>
    api.delete<ResponseData>(`/user/diaries/${diaryId}`),

  likeDiary: (userId: string, diaryId: number) =>
    api.post<ResponseData<{ liked: boolean }>>(`/user/diaries/${diaryId}/like`, { user_id: userId }),

  commentDiary: (userId: string, diaryId: number, content: string) =>
    api.post<ResponseData>(`/user/diaries/${diaryId}/comment`, { user_id: userId, content }),

  getStats: (userId: string) =>
    api.get<ResponseData<UserStats>>(`/user/stats?user_id=${userId}`),

  getTrend: (userId: string, days: number) =>
    api.get<ResponseData<UserTrendData>>(`/user/stats/trend?user_id=${userId}&days=${days}`),
};

export default api;