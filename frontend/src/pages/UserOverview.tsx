import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
} from '@mui/material';
import { TrendingUp, People, TagOutlined, Star } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { UserStats, UserTrendData } from '../api';
import { taskEventEmitter, TASK_EVENTS } from '../utils/eventEmitter';

const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const statsRes = await userAPI.getStats(user.id);
      if (statsRes.data.code === 200) {
        setStats(statsRes.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleTaskUpdate = () => {
      fetchStats();
    };

    taskEventEmitter.on(TASK_EVENTS.TASK_CREATED, handleTaskUpdate);
    taskEventEmitter.on(TASK_EVENTS.TASK_UPDATED, handleTaskUpdate);
    taskEventEmitter.on(TASK_EVENTS.TASK_DELETED, handleTaskUpdate);
    taskEventEmitter.on(TASK_EVENTS.TASK_TOGGLED, handleTaskUpdate);

    return () => {
      taskEventEmitter.off(TASK_EVENTS.TASK_CREATED, handleTaskUpdate);
      taskEventEmitter.off(TASK_EVENTS.TASK_UPDATED, handleTaskUpdate);
      taskEventEmitter.off(TASK_EVENTS.TASK_DELETED, handleTaskUpdate);
      taskEventEmitter.off(TASK_EVENTS.TASK_TOGGLED, handleTaskUpdate);
    };
  }, [user]);

  const statCards = [
    {
      title: '今日任务完成',
      value: `${stats?.today_completed || 0}/${stats?.today_total || 0}`,
      icon: TagOutlined,
      color: '#6366f1',
    },
    {
      title: '今日完成率',
      value: `${stats?.today_rate || 0}%`,
      icon: TrendingUp,
      color: '#22c55e',
    },
    {
      title: '伙伴数',
      value: stats?.friend_count || 0,
      icon: People,
      color: '#f59e0b',
    },
    {
      title: '历史平均率',
      value: `${stats?.avg_rate || 0}%`,
      icon: Star,
      color: '#ec4899',
    },
  ];

  return (
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
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

const TrendChart: React.FC = () => {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<UserTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'halfYear'>('week');

  const timeMap = {
    week: 7,
    month: 30,
    quarter: 90,
    halfYear: 180,
  };

  const timeLabels = {
    week: '近一周',
    month: '近一个月',
    quarter: '近三个月',
    halfYear: '近半年',
  };

  useEffect(() => {
    if (!user) return;
    fetchTrend();
  }, [user, timeRange]);

  const fetchTrend = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const trendRes = await userAPI.getTrend(user.id, timeMap[timeRange]);
      if (trendRes.data.code === 200) {
        setTrendData(trendRes.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch trend');
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7'];

  const chartData = trendData?.dates.map((date, index) => {
    const obj: Record<string, string | number> = { date };
    Object.keys(trendData.trend_data).forEach((userId) => {
      obj[userId] = trendData.trend_data[userId][index];
    });
    return obj;
  }) || [];

  const lines = trendData ? Object.keys(trendData.user_names).map((userId, index) => ({
    name: trendData.user_names[userId],
    dataKey: userId,
    color: colors[index % colors.length],
  })) : [];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6">任务完成率趋势</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {(Object.keys(timeLabels) as ('week' | 'month' | 'quarter' | 'halfYear')[]).map((key) => (
              <Chip
                key={key}
                label={timeLabels[key]}
                onClick={() => setTimeRange(key)}
                color={timeRange === key ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value: number | string, name: string) => {
                const nickname = trendData?.user_names[name] || name;
                return [`${value}%`, nickname];
              }}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name || line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const UserOverview: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" mb={4}>数据总览</Typography>
      <StatsCards />
      <TrendChart />
    </Box>
  );
};

export { StatsCards, TrendChart };
export default UserOverview;
