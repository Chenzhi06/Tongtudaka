import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { Task, Friend } from '../api';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Checkbox,
  Avatar,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';

interface FriendTasksCardsProps {
  selectedDate: dayjs.Dayjs;
}

const FriendTasksCards: React.FC<FriendTasksCardsProps> = ({ selectedDate }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendTasks, setFriendTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchFriendData();
  }, [user, selectedDate]);

  const fetchFriendData = async () => {
    setLoading(true);
    try {
      const friendsRes = await userAPI.getFriends(user!.id);

      let friendsList: Friend[] = [];
      if (friendsRes.data.code === 200) {
        friendsList = friendsRes.data.data.slice(0, 5);
        setFriends(friendsList);
      }

      const tasksPromises = friendsList.map(friend =>
        userAPI.getTasks(friend.id, selectedDate.format('YYYY-MM-DD'))
      );
      const tasksResults = await Promise.all(tasksPromises);

      const tasksMap: Record<string, Task[]> = {};
      friendsList.forEach((friend, index) => {
        if (tasksResults[index].data.code === 200) {
          tasksMap[friend.id] = tasksResults[index].data.data;
        } else {
          tasksMap[friend.id] = [];
        }
      });
      setFriendTasks(tasksMap);
    } catch (e) {
      console.error('获取搭子数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" mb={4}>搭子任务</Typography>
      <Grid container spacing={3}>
        {friends.map((friend) => {
          const friendTaskList = friendTasks[friend.id] || [];
          const completedCount = friendTaskList.filter(t => t.is_completed).length;
          const rate = friendTaskList.length > 0 ? (completedCount / friendTaskList.length) * 100 : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={friend.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, margin: '0 auto' }} src={friend.avatar ? `http://localhost:8000${friend.avatar}` : undefined}>
                      {!friend.avatar && friend.id.slice(-3)}
                    </Avatar>
                    <Typography variant="h6" mt={2} fontWeight="bold">
                      {friend.nickname || friend.id}
                    </Typography>
                    <Typography variant="body2" color="#666">
                      ID: {friend.id}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="#666" mb={1}>今日任务完成率</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={rate}
                      sx={{ height: 12, borderRadius: 1 }}
                    />
                    <Typography variant="body2" textAlign="right" mt={1}>
                      {Math.round(rate)}%
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="#666" mb={2}>任务列表</Typography>
                    {friendTaskList.length === 0 ? (
                      <Typography variant="body2" color="#999" textAlign="center" py={2}>
                        暂无任务
                      </Typography>
                    ) : (
                      <Box>
                        {friendTaskList.map((task) => (
                          <Box
                            key={task.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              py: 1.5,
                              borderBottom: '1px solid #eee',
                            }}
                          >
                            <Checkbox
                              checked={task.is_completed}
                              disabled
                            />
                            <Typography
                              sx={{
                                flex: 1,
                                textDecoration: task.is_completed ? 'line-through' : 'none',
                                color: task.is_completed ? '#999' : '#000',
                                fontSize: '0.875rem',
                              }}
                            >
                              {task.content}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default FriendTasksCards;
