import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import { PersonAdd, People, Check } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { Friend, FriendRequest, User as UserType } from '../api';

const UserFriends: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<(FriendRequest & { agreed?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendStats, setFriendStats] = useState<Record<string, { total: number; rate: number }>>({});

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showNewFriends, setShowNewFriends] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<UserType | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    setLoading(true);
    setError('');
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        userAPI.getFriends(user!.id),
        userAPI.getFriendRequests(user!.id),
      ]);

      let friendsList: Friend[] = [];
      if (friendsRes.data.code === 200) {
        friendsList = friendsRes.data.data;
        setFriends(friendsList);
      }
      if (requestsRes.data.code === 200) {
        setRequests(requestsRes.data.data);
      }

      const allUserIds = [user!.id, ...friendsList.map(f => f.id)];
      const statsPromises = allUserIds.map(id => userAPI.getStats(id));
      const statsResults = await Promise.all(statsPromises);

      const statsMap: Record<string, { total: number; rate: number }> = {};
      allUserIds.forEach((id, index) => {
        if (statsResults[index].data.code === 200) {
          const stats = statsResults[index].data.data;
          console.log(`User ${id} stats:`, stats);
          statsMap[id] = {
            total: stats.total_tasks !== undefined ? stats.total_tasks : 0,
            rate: stats.avg_rate !== undefined ? stats.avg_rate : 0,
          };
        }
      });
      setFriendStats(statsMap);
    } catch (e) {
      setError('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchId) return;
    try {
      const response = await userAPI.searchUser(searchId);
      if (response.data.code === 200) {
        setSearchResult(response.data.data);
      } else {
        setError(response.data.msg);
        setSearchResult(null);
      }
    } catch (e) {
      setError('搜索失败');
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    try {
      const response = await userAPI.sendFriendRequest(user!.id, searchResult.id);
      if (response.data.code === 200) {
        setError('申请已发送');
        setSearchResult(null);
        setSearchId('');
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('发送失败');
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await userAPI.acceptFriendRequest(requestId);
      if (response.data.code === 200) {
        setRequests(requests.map((r) => (r.id === requestId ? { ...r, agreed: true } : r)));
        fetchFriends();
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('操作失败');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const severity = error.includes('成功') || error.includes('已发送') ? 'success' : 'error';
    return <Alert severity={severity}>{error}</Alert>;
  }

  const allFriends = [{ ...user!, signature: user?.signature || '' } as Friend, ...friends].slice(0, 6);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">搭子列表</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setShowAddFriend(true)}
          >
            添加好友
          </Button>
          <Button
            variant="contained"
            startIcon={<People />}
            onClick={() => setShowNewFriends(true)}
            sx={{ backgroundColor: '#7c3aed', '&:hover': { backgroundColor: '#6d28d9' } }}
          >
            新伙伴
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {allFriends.map((friend, index) => (
          <Grid item xs={12} sm={6} md={4} key={friend.id}>
            <Card sx={{ overflow: 'hidden' }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    background: friend.background
                      ? `url(http://localhost:8000${friend.background}) center/cover`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    position: 'absolute',
                    top: 'calc(100% - 40px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: '4px solid #fff',
                  }}
                  src={friend.avatar ? `http://localhost:8000${friend.avatar}` : undefined}
                >
                  {!friend.avatar && friend.id.slice(-3)}
                </Avatar>
              </Box>
              <CardContent sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="#666" mb={2}>
                  {friend.signature || '暂无签名'}
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={1}>
                  {friend.nickname || friend.id}
                </Typography>
                <Typography variant="body2" color="#666" mb={1}>
                  ID: {friend.id}
                </Typography>
                <Typography variant="body2" color="#666" mb={1}>
                  {friend.phone}
                </Typography>
                <Typography variant="body2" color="#666" mb={3}>
                  {friend.email}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {friendStats[friend.id]?.total || 0}
                    </Typography>
                    <Typography variant="caption">历史任务总数</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {friendStats[friend.id]?.rate || 0}%
                    </Typography>
                    <Typography variant="caption">历史平均完成率</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={showAddFriend} onClose={() => {
        setShowAddFriend(false);
        setSearchId('');
        setSearchResult(null);
        setError('');
      }}>
        <DialogTitle>添加好友</DialogTitle>
        <DialogContent>
          {error && (
            <Alert
              severity={error.includes('成功') || error.includes('已发送') ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          <TextField
            label="输入用户ID"
            fullWidth
            margin="normal"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setSearchResult(null);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
          />
          <Button onClick={handleSearchUser} fullWidth>
            搜索
          </Button>
          {searchResult && (
            <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar src={searchResult.avatar ? `http://localhost:8000${searchResult.avatar}` : undefined}>
                  {!searchResult.avatar && searchResult.id.slice(-3)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="bold">{searchResult.nickname || searchResult.id}</Typography>
                  <Typography variant="body2" color="#666">{searchResult.signature}</Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleSendRequest}
              >
                发送好友申请
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddFriend(false);
            setSearchId('');
            setSearchResult(null);
            setError('');
          }}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNewFriends} onClose={() => setShowNewFriends(false)}>
        <DialogTitle>新伙伴申请</DialogTitle>
        <DialogContent>
          {requests.length === 0 ? (
            <Typography variant="body2" color="#666" sx={{ textAlign: 'center', py: 4 }}>
              暂无好友申请
            </Typography>
          ) : (
            requests.map((req) => (
              <Box
                key={req.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 3,
                  borderBottom: '1px solid #eee',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ width: 56, height: 56 }} src={req.avatar ? `http://localhost:8000${req.avatar}` : undefined}>
                    {!req.avatar && req.user_id.slice(-3)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {req.user_id}
                    </Typography>
                    <Typography variant="body2" color="#666">
                      ID：{req.user_id}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant={req.agreed ? 'outlined' : 'contained'}
                  startIcon={<Check />}
                  onClick={() => !req.agreed && handleAcceptRequest(req.id)}
                  disabled={req.agreed}
                  sx={{
                    ...(req.agreed && {
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      borderColor: '#d1d5db',
                    }),
                  }}
                >
                  {req.agreed ? '已同意' : '同意'}
                </Button>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFriends(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserFriends;