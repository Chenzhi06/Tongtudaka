import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, X } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showRegister, setShowRegister] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    nickname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [forgetForm, setForgetForm] = useState({
    phone: '',
    email: '',
  });

  const [foundPassword, setFoundPassword] = useState('');
  const [registerSuccessId, setRegisterSuccessId] = useState('');

  const handleLogin = async () => {
    if (!id || !password) {
      setError('请输入用户ID和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(id, password);
      if (response.data.code === 200 && response.data.data) {
        login(response.data.data);
        if (response.data.data.is_admin) {
          navigate('/admin/overview');
        } else {
          navigate('/user/overview');
        }
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.phone || !registerForm.email || !registerForm.password) {
      setError('请填写所有必填项');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(
        registerForm.phone,
        registerForm.email,
        registerForm.password,
        registerForm.confirmPassword,
        registerForm.nickname
      );
      if (response.data.code === 200) {
        setRegisterSuccessId(response.data.data?.user_id || '');
        setRegisterForm({ nickname: '', phone: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = async () => {
    if (!forgetForm.phone || !forgetForm.email) {
      setError('请填写手机号和邮箱');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgetPassword(forgetForm.phone, forgetForm.email);
      if (response.data.code === 200) {
        setFoundPassword(response.data.data?.password || '');
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(foundPassword);
    setError('密码已复制到剪贴板');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 6 }}>
          <Typography variant="h4" align="center" mb={4} fontWeight="bold">
            同途打卡
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="用户ID"
            fullWidth
            margin="normal"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="请输入用户ID"
          />

          <TextField
            label="密码"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 4, py: 2 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '登录'}
          </Button>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              onClick={() => {
                setShowRegister(true);
                setError('');
              }}
            >
              注册用户
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setShowForgetPassword(true);
                setError('');
              }}
            >
              忘记密码
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={showRegister} onClose={() => {
        setShowRegister(false);
        setError('');
        setRegisterSuccessId('');
      }}>
        <DialogTitle>
          新用户注册
          <IconButton
            onClick={() => {
              setShowRegister(false);
              setError('');
              setRegisterSuccessId('');
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <X />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {registerSuccessId ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" mb={2}>注册成功！</Typography>
              <Typography>您的用户ID：</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {registerSuccessId}
              </Typography>
              <Typography variant="body2" mt={2}>请牢记您的用户ID用于登录</Typography>
            </Box>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField
                label="昵称"
                fullWidth
                margin="normal"
                value={registerForm.nickname}
                onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                placeholder="选填"
              />
              <TextField
                label="手机号"
                fullWidth
                margin="normal"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              />
              <TextField
                label="邮箱"
                type="email"
                fullWidth
                margin="normal"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
              <TextField
                label="密码"
                type="password"
                fullWidth
                margin="normal"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
              <TextField
                label="确认密码"
                type="password"
                fullWidth
                margin="normal"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!registerSuccessId && (
            <Button onClick={handleRegister} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : '注册'}
            </Button>
          )}
          <Button onClick={() => {
            setShowRegister(false);
            setError('');
            setRegisterSuccessId('');
          }}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showForgetPassword} onClose={() => {
        setShowForgetPassword(false);
        setError('');
        setFoundPassword('');
      }}>
        <DialogTitle>
          找回密码
          <IconButton
            onClick={() => {
              setShowForgetPassword(false);
              setError('');
              setFoundPassword('');
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <X />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {foundPassword ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="h6" mb={2}>您的密码：</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  value={foundPassword}
                  disabled
                  fullWidth
                  sx={{ backgroundColor: '#f5f5f5' }}
                />
                <Button onClick={handleCopyPassword}>复制</Button>
              </Box>
            </Box>
          ) : (
            <>
              <TextField
                label="手机号"
                fullWidth
                margin="normal"
                value={forgetForm.phone}
                onChange={(e) => setForgetForm({ ...forgetForm, phone: e.target.value })}
              />
              <TextField
                label="邮箱"
                type="email"
                fullWidth
                margin="normal"
                value={forgetForm.email}
                onChange={(e) => setForgetForm({ ...forgetForm, email: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!foundPassword && (
            <Button onClick={handleForgetPassword} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : '查询'}
            </Button>
          )}
          <Button onClick={() => {
            setShowForgetPassword(false);
            setError('');
            setFoundPassword('');
          }}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;