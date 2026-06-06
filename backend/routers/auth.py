from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from main import SessionLocal
from models import User
from schemas import UserCreate, UserLogin, UserUpdate, ForgetPasswordRequest, Response
from datetime import datetime
from passlib.context import CryptContext
import os
from uuid import uuid4

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def generate_user_id(db: Session) -> str:
    now = datetime.now()
    year_month = now.strftime("%Y%m")
    count = db.query(User).filter(User.id.like(f"{year_month}%")).count()
    if count >= 999:
        raise HTTPException(status_code=400, detail="本月注册名额已满，请下个月再来！")
    return f"{year_month}{str(count).zfill(3)}"

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        return {"code": 400, "msg": "两次输入的密码不一致", "data": None}
    
    if db.query(User).filter(User.phone == user.phone).first():
        return {"code": 400, "msg": "该手机号已被注册", "data": None}
    
    if db.query(User).filter(User.email == user.email).first():
        return {"code": 400, "msg": "该邮箱已被注册", "data": None}
    
    try:
        user_id = generate_user_id(db)
    except HTTPException as e:
        return {"code": 400, "msg": e.detail, "data": None}
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        id=user_id,
        nickname=user.nickname or "",
        password=hashed_password,
        email=user.email,
        phone=user.phone,
        signature="",
        avatar="",
        background="",
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"code": 200, "msg": "注册成功", "data": {"user_id": user_id}}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user.id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    if not verify_password(user.password, db_user.password):
        return {"code": 400, "msg": "密码错误", "data": None}
    
    from datetime import datetime, timezone, timedelta
    def to_beijing_time(dt):
        if dt is None:
            return None
        if isinstance(dt, str):
            return dt
        beijing_tz = timezone(timedelta(hours=8))
        return dt.replace(tzinfo=timezone.utc).astimezone(beijing_tz)

    return {
        "code": 200, 
        "msg": "登录成功", 
        "data": {
            "id": db_user.id,
            "nickname": db_user.nickname or "",
            "email": db_user.email,
            "phone": db_user.phone,
            "signature": db_user.signature,
            "avatar": db_user.avatar,
            "background": db_user.background,
            "is_admin": db_user.is_admin,
            "create_time": to_beijing_time(db_user.create_time)
        }
    }

@router.post("/forget_password")
def forget_password(request: ForgetPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.phone == request.phone,
        User.email == request.email
    ).first()
    
    if not db_user:
        return {"code": 400, "msg": "手机号或邮箱不正确", "data": None}
    
    return {"code": 200, "msg": "查询成功", "data": {"password": db_user.password}}

@router.get("/user/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    from datetime import datetime, timezone, timedelta
    def to_beijing_time(dt):
        if dt is None:
            return None
        if isinstance(dt, str):
            return dt
        beijing_tz = timezone(timedelta(hours=8))
        return dt.replace(tzinfo=timezone.utc).astimezone(beijing_tz)
    
    return {
        "code": 200, 
        "msg": "success", 
        "data": {
            "id": db_user.id,
            "nickname": db_user.nickname or "",
            "email": db_user.email,
            "phone": db_user.phone,
            "signature": db_user.signature,
            "avatar": db_user.avatar,
            "background": db_user.background,
            "create_time": to_beijing_time(db_user.create_time)
        }
    }

@router.put("/user/{user_id}")
def update_user(user_id: str, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    if user.phone and db.query(User).filter(User.phone == user.phone, User.id != user_id).first():
        return {"code": 400, "msg": "该手机号已被使用", "data": None}
    
    if user.email and db.query(User).filter(User.email == user.email, User.id != user_id).first():
        return {"code": 400, "msg": "该邮箱已被使用", "data": None}
    
    if user.nickname is not None:
        db_user.nickname = user.nickname
    if user.signature:
        db_user.signature = user.signature[:20] if len(user.signature) > 20 else user.signature
    if user.avatar:
        db_user.avatar = user.avatar
    if user.background:
        db_user.background = user.background
    if user.phone:
        db_user.phone = user.phone
    if user.email:
        db_user.email = user.email
    
    db.commit()
    db.refresh(db_user)
    
    return {"code": 200, "msg": "更新成功", "data": None}

@router.post("/upload/avatar")
async def upload_avatar(user_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        return {"code": 400, "msg": "只支持图片格式", "data": None}
    
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join("uploads/avatars", unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    db_user.avatar = f"/uploads/avatars/{unique_filename}"
    db.commit()
    
    from datetime import datetime, timezone, timedelta
    def to_beijing_time(dt):
        if dt is None:
            return None
        if isinstance(dt, str):
            return dt
        beijing_tz = timezone(timedelta(hours=8))
        return dt.replace(tzinfo=timezone.utc).astimezone(beijing_tz)
    
    return {
        "code": 200,
        "msg": "上传成功",
        "data": {
            "id": db_user.id,
            "nickname": db_user.nickname or "",
            "email": db_user.email,
            "phone": db_user.phone,
            "signature": db_user.signature,
            "avatar": db_user.avatar,
            "background": db_user.background,
            "is_admin": db_user.is_admin,
            "create_time": to_beijing_time(db_user.create_time)
        }
    }

@router.post("/upload/background")
async def upload_background(user_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        return {"code": 400, "msg": "只支持图片格式", "data": None}
    
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join("uploads/backgrounds", unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    db_user.background = f"/uploads/backgrounds/{unique_filename}"
    db.commit()
    
    from datetime import datetime, timezone, timedelta
    def to_beijing_time(dt):
        if dt is None:
            return None
        if isinstance(dt, str):
            return dt
        beijing_tz = timezone(timedelta(hours=8))
        return dt.replace(tzinfo=timezone.utc).astimezone(beijing_tz)
    
    return {
        "code": 200,
        "msg": "上传成功",
        "data": {
            "id": db_user.id,
            "nickname": db_user.nickname or "",
            "email": db_user.email,
            "phone": db_user.phone,
            "signature": db_user.signature,
            "avatar": db_user.avatar,
            "background": db_user.background,
            "is_admin": db_user.is_admin,
            "create_time": to_beijing_time(db_user.create_time)
        }
    }