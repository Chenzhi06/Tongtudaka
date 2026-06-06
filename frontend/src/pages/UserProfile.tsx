import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { User } from '../api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import { Edit, PhotoCamera } from '@mui/icons-material';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    signature: '',
    phone: '',
    email: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);
  const editBackgroundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setEditForm({
      nickname: user.nickname || '',
      signature: user.signature || '',
      phone: user.phone || '',
      email: user.email || '',
    });
    setAvatarPreview(user.avatar || '');
    setBackgroundPreview(user.background || '');
    setLoading(false);
  }, [user]);

  const handleUpdate = async () => {
    try {
      const response = await authAPI.updateUser(user!.id, {
        nickname: editForm.nickname,
        signature: editForm.signature.slice(0, 20),
        phone: editForm.phone,
        email: editForm.email,
      });
      if (response.data.code === 200) {
        updateUser({
          nickname: editForm.nickname,
          signature: editForm.signature.slice(0, 20),
          phone: editForm.phone,
          email: editForm.email,
        });
        setShowEdit(false);
        setError('更新成功');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('更新失败');
    }
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
  };

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      const response = await authAPI.uploadBackground(user.id, file);
      if (response.data.code === 200 && response.data.data) {
        updateUser(response.data.data);
        setError('背景图更新成功');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      setError('上传失败');
    }
  };

  const handleEditAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      const response = await authAPI.uploadAvatar(user.id, file);
      if (response.data.code === 200 && response.data.data) {
        updateUser(response.data.data);
        setAvatarPreview(response.data.data.avatar || '');
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      setError('上传失败');
    }
  };

  const handleEditBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      const response = await authAPI.uploadBackground(user.id, file);
      if (response.data.code === 200 && response.data.data) {
        updateUser(response.data.data);
        setBackgroundPreview(response.data.data.background || '');
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      setError('上传失败');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN');
    } catch {
      return dateStr.split('T')[0];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ paddingTop: '24px', paddingX: '20px' }}>
      <Typography variant="h4" mb={4}>个人主页</Typography>

      {error && <Alert severity={error.includes('成功') ? 'success' : 'error'} sx={{ mb: 4 }}>{error}</Alert>}

      <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              background: backgroundPreview 
                ? `url(http://localhost:8000${backgroundPreview}) center/cover` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              cursor: 'pointer',
              '&:hover': {
                filter: 'brightness(0.9)',
              },
            }}
            onClick={handleBackgroundClick}
          />
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundChange}
            style={{ display: 'none' }}
          />
          <Avatar
            sx={{
              width: 120,
              height: 120,
              position: 'absolute',
              top: 'calc(100% - 60px)',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '4px solid #fff',
              bgcolor: '#f0f0f0',
            }}
            src={avatarPreview ? `http://localhost:8000${avatarPreview}` : undefined}
          >
            {!avatarPreview && user?.id.slice(-3)}
          </Avatar>
        </Box>

        <CardContent sx={{ mt: '82px', textAlign: 'center', pb: '28px' }}>
          <Typography variant="h4" fontWeight="bold" mb="12px">
            {user?.nickname || user?.id}
          </Typography>
          <Typography variant="body2" color="#666" mb="14px">
            ID: {user?.id}
          </Typography>
          <Typography variant="body1" color="#666" mb="24px">
            {user?.signature || '暂无签名'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 400, margin: '0 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="#666" width={80}>电话</Typography>
              <Typography variant="body1">{user?.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="#666" width={80}>邮箱</Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="#666" width={80}>注册时间</Typography>
              <Typography variant="body1">{formatDate(user?.create_time)}</Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            sx={{ mt: '32px' }}
            onClick={() => setShowEdit(true)}
            startIcon={<Edit />}
          >
            修改个人信息
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showEdit} onClose={() => setShowEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>修改个人信息</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>头像</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ width: 80, height: 80, bgcolor: '#f0f0f0' }}
                  src={avatarPreview ? `http://localhost:8000${avatarPreview}` : undefined}
                >
                  {!avatarPreview && user?.id.slice(-3)}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  更换头像
                  <input
                    ref={editAvatarInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleEditAvatarChange}
                  />
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>背景图</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    background: backgroundPreview 
                      ? `url(http://localhost:8000${backgroundPreview}) center/cover` 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 1,
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  更换背景图
                  <input
                    ref={editBackgroundInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleEditBackgroundChange}
                  />
                </Button>
              </Box>
            </Box>

            <TextField
              label="昵称"
              fullWidth
              margin="normal"
              value={editForm.nickname}
              onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
              placeholder="选填"
            />
            <TextField
              label="个人签名"
              fullWidth
              margin="normal"
              value={editForm.signature}
              onChange={(e) => setEditForm({ ...editForm, signature: e.target.value })}
              placeholder="最多20个字"
              inputProps={{ maxLength: 20 }}
            />
            <TextField
              label="手机号"
              fullWidth
              margin="normal"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              margin="normal"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEdit(false)}>取消</Button>
          <Button onClick={handleUpdate}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;