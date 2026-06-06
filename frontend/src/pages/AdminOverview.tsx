import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { People, TrendingUp, CheckCircle, AccessTime } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../api';
import { Stats, TrendData } from '../api';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userTrend, setUserTrend] = useState<TrendData | null>(null);
  const [taskTrend, setTaskTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, userTrendRes, taskTrendRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUserTrend(7),
          adminAPI.getTaskTrend(7),
        ]);

        if (statsRes.data.code === 200) {
          setStats(statsRes.data.data);
        }
        if (userTrendRes.data.code === 200) {
          setUserTrend(userTrendRes.data.data);
        }
        if (taskTrendRes.data.code === 200) {
          setTaskTrend(taskTrendRes.data.data);
        }
      } catch (e) {
        setError('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statCards = [
    {
      title: '用户总数量',
      value: stats?.total_users || 0,
      icon: People,
      color: '#6366f1',
    },
    {
      title: '今日活跃用户',
      value: stats?.today_active || 0,
      icon: TrendingUp,
      color: '#22c55e',
    },
    {
      title: '任务完成总数',
      value: stats?.total_completed_tasks || 0,
      icon: CheckCircle,
      color: '#f59e0b',
    },
    {
      title: '今日完成任务',
      value: stats?.today_completed || 0,
      icon: AccessTime,
      color: '#ec4899',
    },
  ];

  const userTrendData = userTrend?.dates.map((date, index) => ({
    date,
    count: userTrend.counts[index],
  })) || [];

  const taskTrendData = taskTrend?.dates.map((date, index) => ({
    date,
    count: taskTrend.counts[index],
  })) || [];

  return (
    <Box>
      <Typography variant="h4" mb={4}>数据总览</Typography>

      <Grid container spacing={4} mb={6}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      backgroundColor: `${card.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: 32, color: card.color }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="#666">{card.title}</Typography>
                    <Typography variant="h4" fontWeight="bold" color={card.color}>
                      {card.value.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={4}>用户每日活跃趋势</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={4}>任务完成每日趋势</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={taskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverview;