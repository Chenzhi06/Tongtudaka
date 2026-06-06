import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { Task } from '../api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { getDailyQuote } from '../utils/format';
import { taskEventEmitter, TASK_EVENTS } from '../utils/eventEmitter';

interface MyTasksCardProps {
  selectedDate: dayjs.Dayjs;
  onError: (msg: string) => void;
  onClearError: () => void;
}

const MyTasksCard: React.FC<MyTasksCardProps> = ({ selectedDate, onError, onClearError }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchMyTasks();
    onClearError();
  }, [user, selectedDate]);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getTasks(user!.id, selectedDate.format('YYYY-MM-DD'));
      if (response.data.code === 200) {
        setTasks(response.data.data);
      }
    } catch (e) {
      onError('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, isCompleted: boolean) => {
    try {
      const response = await userAPI.updateTask(taskId, { is_completed: !isCompleted });
      if (response.data.code === 200) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, is_completed: !isCompleted } : t)));
        taskEventEmitter.emit(TASK_EVENTS.TASK_TOGGLED);
      }
    } catch (e) {
      onError('操作失败');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim()) return;
    if (tasks.length >= 10) {
      onError('每日任务上限为10个');
      return;
    }

    try {
      const response = await userAPI.createTask(user!.id, newTaskContent.trim(), selectedDate.format('YYYY-MM-DD'));
      if (response.data.code === 200) {
        setNewTaskContent('');
        setAddingTask(false);
        fetchMyTasks();
        taskEventEmitter.emit(TASK_EVENTS.TASK_CREATED);
      } else {
        onError(response.data.msg);
      }
    } catch (e) {
      onError('添加失败');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await userAPI.deleteTask(taskId);
      if (response.data.code === 200) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        taskEventEmitter.emit(TASK_EVENTS.TASK_DELETED);
      }
    } catch (e) {
      onError('删除失败');
    }
  };

  const isToday = selectedDate.isSame(dayjs(), 'day');
  const isFuture = selectedDate.isAfter(dayjs(), 'day');
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) {
    return (
      <Card sx={{ height: 'fit-content' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, margin: '0 auto' }} src={user?.avatar ? `http://localhost:8000${user.avatar}` : undefined}>
            {!user?.avatar && user?.id.slice(-3)}
          </Avatar>
          <Typography variant="h6" mt={2}>
            {user?.nickname || user?.id}
          </Typography>
          <Typography variant="body2" color="#666" mt={1}>
            {getDailyQuote()}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="#666" mb={1}>今日任务完成率</Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 12, borderRadius: 1 }}
          />
          <Typography variant="body2" textAlign="right" mt={1}>
            {Math.round(progress)}%
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="#666" mb={2}>任务列表</Typography>
          {tasks.length === 0 && !addingTask ? (
            <Typography variant="body2" textAlign="center" py={4} color="#999">
              {isFuture ? '未来日期不可编辑' : '暂无任务'}
            </Typography>
          ) : (
            <>
              {tasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <Checkbox
                    checked={task.is_completed}
                    onChange={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={!isToday}
                  />
                  <Typography
                    sx={{
                      flex: 1,
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      color: task.is_completed ? '#999' : '#000',
                    }}
                  >
                    {task.content}
                  </Typography>
                  {isToday && (
                    <Button
                      color="error"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Delete />
                    </Button>
                  )}
                </Box>
              ))}
            </>
          )}

          {isToday && (
            addingTask ? (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="输入任务内容..."
                  fullWidth
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  autoFocus
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={handleAddTask}>确定</Button>
                  <Button onClick={() => {
                    setAddingTask(false);
                    setNewTaskContent('');
                  }}>取消</Button>
                </Box>
              </Box>
            ) : (
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 4 }}
                onClick={() => setAddingTask(true)}
                startIcon={<Add />}
              >
                添加任务
              </Button>
            )
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyTasksCard;
