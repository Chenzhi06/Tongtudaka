from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List

class UserCreate(BaseModel):
    phone: str
    email: EmailStr
    password: str
    confirm_password: str
    nickname: Optional[str] = ""

class UserLogin(BaseModel):
    id: str
    password: str

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    signature: Optional[str] = None
    avatar: Optional[str] = None
    background: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class TaskCreate(BaseModel):
    user_id: str
    content: str
    date: str

class TaskUpdate(BaseModel):
    content: Optional[str] = None
    is_completed: Optional[bool] = None

class FriendRequest(BaseModel):
    user_id: str
    friend_id: str

class DiaryCreate(BaseModel):
    user_id: str
    content: str
    images: Optional[List[str]] = None

class DiaryUpdate(BaseModel):
    content: str
    images: Optional[List[str]] = None

class CommentCreate(BaseModel):
    diary_id: int
    content: str

class LikeCommentRequest(BaseModel):
    user_id: str

class CommentRequest(BaseModel):
    user_id: str
    content: str

class ForgetPasswordRequest(BaseModel):
    phone: str
    email: EmailStr

class Response(BaseModel):
    code: int
    msg: str
    data: Optional[dict] = None