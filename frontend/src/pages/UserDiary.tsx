import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { Diary, Comment } from '../api';
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
  Divider,
  IconButton,
  Grid,
} from '@mui/material';
import { ThumbUp, Message, Edit, Delete, Send, X, Add } from '@mui/icons-material';
import { getSmartTime } from '../utils/format';

const MAX_IMAGES = 9;

// 多图缩略图样式：96px 正方形
const THUMBNAIL_SIZE = 96;
const THUMBNAIL_GAP = 5;

const ImageGrid: React.FC<{ images: string[]; onImageClick: (index: number) => void }> = ({ images, onImageClick }) => {
  const count = images.length;

  if (count === 0) return null;

  // 单张图样式：卡片 55% 宽度，上限 300px 宽 / 240px 高
  if (count === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <img
          src={images[0]}
          alt=""
          onClick={() => onImageClick(0)}
          style={{
            width: '55%',
            maxWidth: '300px',
            maxHeight: '240px',
            height: 'auto',
            borderRadius: 8,
            cursor: 'pointer',
            objectFit: 'cover'
          }}
        />
      </Box>
    );
  }

  // 多图缩略图样式：96px 正方形，间距 5px
  const thumbnailStyle: React.CSSProperties = {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 4,
    cursor: 'pointer',
    objectFit: 'cover'
  };

  const getGridLayout = () => {
    switch (count) {
      case 2:
        return (
          <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                onClick={() => onImageClick(index)}
                style={thumbnailStyle}
              />
            ))}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                onClick={() => onImageClick(index)}
                style={thumbnailStyle}
              />
            ))}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: THUMBNAIL_GAP }}>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(0, 2).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(2).map((img, index) => (
                <img
                  key={index + 2}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 2)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
          </Box>
        );
      case 5:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: THUMBNAIL_GAP }}>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(3).map((img, index) => (
                <img
                  key={index + 3}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 3)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
          </Box>
        );
      case 6:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: THUMBNAIL_GAP }}>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(3).map((img, index) => (
                <img
                  key={index + 3}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 3)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
          </Box>
        );
      case 7:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: THUMBNAIL_GAP }}>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(3, 6).map((img, index) => (
                <img
                  key={index + 3}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 3)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              <img
                src={images[6]}
                alt=""
                onClick={() => onImageClick(6)}
                style={thumbnailStyle}
              />
            </Box>
          </Box>
        );
      case 8:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: THUMBNAIL_GAP }}>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(3, 6).map((img, index) => (
                <img
                  key={index + 3}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 3)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(6).map((img, index) => (
                <img
                  key={index + 6}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 6)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
          </Box>
        );
      case 9:
      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: THUMBNAIL_GAP }}>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(3, 6).map((img, index) => (
                <img
                  key={index + 3}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 3)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: THUMBNAIL_GAP }}>
              {images.slice(6, 9).map((img, index) => (
                <img
                  key={index + 6}
                  src={img}
                  alt=""
                  onClick={() => onImageClick(index + 6)}
                  style={thumbnailStyle}
                />
              ))}
            </Box>
          </Box>
        );
    }
  };

  return <Box>{getGridLayout()}</Box>;
};

const UserDiary: React.FC = () => {
  const { user } = useAuth();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [editDiary, setEditDiary] = useState<Diary | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  const [likedDiaries, setLikedDiaries] = useState<Set<number>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchDiaries();
  }, [user]);

  const fetchDiaries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getDiaries(user!.id);
      if (response.data.code === 200) {
        setDiaries(response.data.data);
      }
    } catch (e) {
      setError('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - newImages.length;
    const filesToAdd = Array.from(files).slice(0, remaining);

    if (filesToAdd.length < files.length) {
      setError(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImages((prev) => [...prev, event.target?.result as string]);
        setError('');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handlePost = async () => {
    if (!newContent.trim()) return;
    try {
      const response = await userAPI.createDiary(user!.id, newContent.trim(), newImages.length > 0 ? newImages : undefined);
      if (response.data.code === 200) {
        setNewContent('');
        setNewImages([]);
        setShowPost(false);
        fetchDiaries();
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('发布失败');
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - editImages.length;
    const filesToAdd = Array.from(files).slice(0, remaining);

    if (filesToAdd.length < files.length) {
      setError(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditImages((prev) => [...prev, event.target?.result as string]);
        setError('');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEdit = async () => {
    if (!editDiary || !editContent.trim()) return;
    try {
      const response = await userAPI.updateDiary(editDiary.id, editContent.trim(), editImages.length > 0 ? editImages : undefined);
      if (response.data.code === 200) {
        setEditDiary(null);
        setEditContent('');
        setEditImages([]);
        fetchDiaries();
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('编辑失败');
    }
  };

  const handleDelete = async (diaryId: number) => {
    try {
      const response = await userAPI.deleteDiary(diaryId);
      if (response.data.code === 200) {
        setDiaries(diaries.filter((d) => d.id !== diaryId));
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('删除失败');
    }
  };

  const handleLike = async (diaryId: number) => {
    try {
      const response = await userAPI.likeDiary(user!.id, diaryId);
      if (response.data.code === 200) {
        const liked = response.data.data?.liked;
        if (liked) {
          setLikedDiaries((prev) => new Set([...prev, diaryId]));
          setDiaries(diaries.map((d) => {
            if (d.id === diaryId) {
              return {
                ...d,
                likes: d.likes + 1,
                likes_list: [...(d.likes_list || []), { user_id: user!.id, username: user!.nickname || user!.id }]
              };
            }
            return d;
          }));
        } else {
          setLikedDiaries((prev) => {
            const next = new Set(prev);
            next.delete(diaryId);
            return next;
          });
          setDiaries(diaries.map((d) => {
            if (d.id === diaryId) {
              return {
                ...d,
                likes: d.likes - 1,
                likes_list: (d.likes_list || []).filter(l => l.user_id !== user!.id)
              };
            }
            return d;
          }));
        }
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('操作失败');
    }
  };

  const handleComment = async (diaryId: number) => {
    const content = commentInput[diaryId];
    if (!content?.trim()) return;
    try {
      const response = await userAPI.commentDiary(user!.id, diaryId, content.trim());
      if (response.data.code === 200) {
        setCommentInput((prev) => ({ ...prev, [diaryId]: '' }));
        fetchDiaries();
      } else {
        setError(response.data.msg);
      }
    } catch (e) {
      setError('评论失败');
    }
  };

  const openImagePreview = (images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setPreviewImage(images[index]);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setPreviewIndex(0);
    setPreviewImages([]);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex = previewIndex;
    if (direction === 'prev') {
      newIndex = previewIndex > 0 ? previewIndex - 1 : previewImages.length - 1;
    } else {
      newIndex = previewIndex < previewImages.length - 1 ? previewIndex + 1 : 0;
    }
    setPreviewIndex(newIndex);
    setPreviewImage(previewImages[newIndex]);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">互督日记</Typography>
        <Button variant="contained" onClick={() => setShowPost(true)}>
          发布日记
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {diaries.map((diary) => (
          <Card key={diary.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar src={diary.avatar ? `http://localhost:8000${diary.avatar}` : undefined}>
                  {!diary.avatar && diary.username.slice(-3)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight="bold">{diary.username}</Typography>
                  <Typography variant="body2" color="#666">{getSmartTime(diary.create_time)}</Typography>
                </Box>
                {diary.is_own && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => {
                      setEditDiary(diary);
                      setEditContent(diary.content);
                      setEditImages([...(diary.images || [])]);
                    }}>
                      <Edit />
                    </Button>
                    <Button color="error" onClick={() => handleDelete(diary.id)}>
                      <Delete />
                    </Button>
                  </Box>
                )}
              </Box>

              <Typography variant="body1" mt={3} sx={{ fontSize: '15px', lineHeight: 1.45 }}>{diary.content}</Typography>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                <ImageGrid images={diary.images || []} onImageClick={(index) => openImagePreview(diary.images || [], index)} />
              </Box>

              <Box sx={{ display: 'flex', gap: 4, mt: (diary.images && diary.images.length > 0) ? '12px' : 3 }}>
                <Button
                  onClick={() => handleLike(diary.id)}
                  sx={{ color: likedDiaries.has(diary.id) ? '#ef4444' : '#666' }}
                >
                  <ThumbUp />
                  <Typography variant="body2" ml={1}>{diary.likes}</Typography>
                </Button>
                <Button onClick={() => { }}>
                  <Message />
                  <Typography variant="body2" ml={1}>{diary.comments.length}</Typography>
                </Button>
              </Box>

              {diary.likes_list && diary.likes_list.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="#003366">
                    {diary.likes_list.map(l => l.username).join('、')}
                  </Typography>
                  <Typography variant="body2" color="#666">点赞了这条动态</Typography>
                </Box>
              )}

              {diary.comments.length > 0 && (
                <>
                  <Divider sx={{ mt: 3 }} />
                  <Box sx={{ mt: 3 }}>
                    {diary.comments.map((comment) => (
                      <Box key={comment.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }} src={comment.avatar ? `http://localhost:8000${comment.avatar}` : undefined}>
                            {!comment.avatar && comment.username.slice(-3)}
                          </Avatar>
                          <Typography variant="body1" fontWeight="bold">{comment.username}</Typography>
                          <Typography variant="body2" color="#666">{getSmartTime(comment.create_time)}</Typography>
                        </Box>
                        <Typography variant="body2" ml={6}>{comment.content}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <TextField
                  placeholder="发表评论..."
                  fullWidth
                  value={commentInput[diary.id] || ''}
                  onChange={(e) => setCommentInput((prev) => ({ ...prev, [diary.id]: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(diary.id)}
                />
                <Button variant="contained" onClick={() => handleComment(diary.id)}>
                  <Send />
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={showPost} onClose={() => {
        setShowPost(false);
        setNewContent('');
        setNewImages([]);
        setError('');
      }} maxWidth="md">
        <DialogTitle>发布日记</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="日记内容"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="#666" mb={1}>上传图片 ({newImages.length}/{MAX_IMAGES})</Typography>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <Button
              variant="outlined"
              component="label"
              htmlFor="image-upload"
              fullWidth
              disabled={newImages.length >= MAX_IMAGES}
            >
              <Add sx={{ mr: 1 }} />
              {newImages.length >= MAX_IMAGES ? '已达上限' : '选择图片'}
            </Button>
            {newImages.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {newImages.map((img, index) => (
                    <Grid item xs={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 8 }} />
                        <IconButton
                          sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff' }}
                          onClick={() => removeImage(index)}
                        >
                          <X />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowPost(false);
            setNewContent('');
            setNewImages([]);
            setError('');
          }}>
            取消
          </Button>
          <Button onClick={handlePost}>发布</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editDiary} onClose={() => {
        setEditDiary(null);
        setEditContent('');
        setEditImages([]);
        setError('');
      }} maxWidth="md">
        <DialogTitle>编辑日记</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="日记内容"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="#666" mb={1}>图片 ({editImages.length}/{MAX_IMAGES})</Typography>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleEditImageUpload}
              style={{ display: 'none' }}
              id="edit-image-upload"
            />
            <Button
              variant="outlined"
              component="label"
              htmlFor="edit-image-upload"
              fullWidth
              disabled={editImages.length >= MAX_IMAGES}
            >
              <Add sx={{ mr: 1 }} />
              {editImages.length >= MAX_IMAGES ? '已达上限' : '添加图片'}
            </Button>
            {editImages.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {editImages.map((img, index) => (
                    <Grid item xs={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 8 }} />
                        <IconButton
                          sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff' }}
                          onClick={() => removeImage(index, true)}
                        >
                          <X />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDiary(null);
            setEditContent('');
            setEditImages([]);
            setError('');
          }}>
            取消
          </Button>
          <Button onClick={handleEdit}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!previewImage} onClose={closeImagePreview} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, backgroundColor: '#000' }}>
          <Box sx={{ position: 'relative', width: '100%', height: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 1 }}
              onClick={closeImagePreview}
            >
              <X sx={{ fontSize: 32 }} />
            </IconButton>
            {previewImages.length > 1 && (
              <>
                <IconButton
                  sx={{ position: 'absolute', left: 8, color: '#fff', zIndex: 1 }}
                  onClick={() => navigateImage('prev')}
                >
                  <span style={{ fontSize: 48 }}>‹</span>
                </IconButton>
                <IconButton
                  sx={{ position: 'absolute', right: 8, color: '#fff', zIndex: 1 }}
                  onClick={() => navigateImage('next')}
                >
                  <span style={{ fontSize: 48 }}>›</span>
                </IconButton>
              </>
            )}
            {previewImage && (
              <img
                src={previewImage}
                alt=""
                style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain' }}
              />
            )}
            {previewImages.length > 1 && (
              <Typography sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 4 }}>
                {previewIndex + 1} / {previewImages.length}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserDiary;
