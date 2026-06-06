from sqlalchemy import Column, Integer, String, Boolean, Date, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.sql import func
from main import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    nickname = Column(String, default="")
    password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    signature = Column(String, default="")
    avatar = Column(String, default="")
    background = Column(String, default="")
    create_time = Column(TIMESTAMP, default=func.now())
    is_admin = Column(Boolean, default=False)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    content = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    date = Column(Date, nullable=False)
    create_time = Column(TIMESTAMP, default=func.now())

class Friend(Base):
    __tablename__ = "friends"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    friend_id = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    apply_time = Column(TIMESTAMP, default=func.now())

class Diary(Base):
    __tablename__ = "diaries"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    content = Column(String, nullable=False)
    images = Column(JSON, nullable=True, default=[])
    create_time = Column(TIMESTAMP, default=func.now())

class LikeComment(Base):
    __tablename__ = "likes_comments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    diary_id = Column(Integer, ForeignKey("diaries.id"))
    user_id = Column(String, ForeignKey("users.id"))
    type = Column(String, nullable=False)
    content = Column(String, nullable=True)
    create_time = Column(TIMESTAMP, default=func.now())