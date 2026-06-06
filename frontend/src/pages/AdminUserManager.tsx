import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit, Delete, DeleteForever } from '@mui/icons-material';
import { adminAPI } from '../api';
import { User } from '../api';

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
}

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 编辑弹窗状态
  const [openEdit, setOpenEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // 删除弹窗状态
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');

  useEffect(() => {
    fetchUsers(pagination.page, pagination.size);
  }, []);

  const fetchUsers = async (page: number, size: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getUsers(page, size);
      if (response.data.code === 200) {
        const data = response.data.data as UsersResponse;
        setUsers(data.users);
        setPagination({
          total: data.total,
          page: data.page,
          size: data.size,
        });
      }
    } catch (e) {
      setError('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchUsers(page, pagination.size);
  };

  // 编辑用户
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      const response = await adminAPI.updateUser(editingUser.id, {
        nickname: editingUser.nickname,
        phone: editingUser.phone,
        email: editingUser.email,
      });
      if (response.data.code === 200) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setOpenEdit(false);
        setEditingUser(null);
      }
    } catch (e) {
      setError('更新失败');
    }
  };

  // 删除用户
  const handleDeleteClick = (userId: string) => {
    setDeletingUserId(userId);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await adminAPI.deleteUser(deletingUserId);
      if (response.data.code === 200) {
        setUsers(users.filter(u => u.id !== deletingUserId));
        setOpenDelete(false);
        setDeletingUserId('');
      }
    } catch (e) {
      setError('删除失败');
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
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" mb={4}>用户管理</Typography>
      
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>用户ID</TableCell>
                  <TableCell>昵称</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>手机号</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.nickname || '未设置'}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(user)}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(user.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {users.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(pagination.total / pagination.size)}
                page={pagination.page}
                onChange={handlePageChange}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={openEdit} onClose={() => { setOpenEdit(false); setEditingUser(null); }}>
        <DialogTitle>编辑用户</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="用户ID"
            fullWidth
            disabled
            value={editingUser?.id || ''}
          />
          <TextField
            margin="dense"
            label="昵称"
            fullWidth
            value={editingUser?.nickname || ''}
            onChange={(e) => editingUser && setEditingUser({ ...editingUser, nickname: e.target.value })}
          />
          <TextField
            margin="dense"
            label="手机号"
            fullWidth
            value={editingUser?.phone || ''}
            onChange={(e) => editingUser && setEditingUser({ ...editingUser, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="邮箱"
            fullWidth
            value={editingUser?.email || ''}
            onChange={(e) => editingUser && setEditingUser({ ...editingUser, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEdit(false); setEditingUser(null); }}>取消</Button>
          <Button onClick={handleEditSave} color="primary">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={openDelete} onClose={() => { setOpenDelete(false); setDeletingUserId(''); }}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除该用户吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDelete(false); setDeletingUserId(''); }}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" startIcon={<DeleteForever />}>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManager;