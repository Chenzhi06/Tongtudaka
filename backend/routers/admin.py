from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from main import SessionLocal
from models import User, Task
from datetime import datetime, timedelta

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    today = datetime.now().date()
    
    total_users = db.query(User).filter(User.is_admin == False).count()
    
    today_active = db.query(User).filter(
        User.is_admin == False,
        func.date(User.create_time) == today
    ).count()
    
    total_completed_tasks = db.query(Task).filter(Task.is_completed == True).count()
    
    today_completed = db.query(Task).filter(
        Task.is_completed == True,
        Task.date == today
    ).count()
    
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "total_users": total_users,
            "today_active": today_active,
            "total_completed_tasks": total_completed_tasks,
            "today_completed": today_completed
        }
    }

@router.get("/user_trend")
def get_user_trend(days: int = 7, db: Session = Depends(get_db)):
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    dates = []
    counts = []
    
    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date.strftime("%Y-%m-%d"))
        count = db.query(User).filter(
            User.is_admin == False,
            func.date(User.create_time) == current_date
        ).count()
        counts.append(count)
        current_date += timedelta(days=1)
    
    return {"code": 200, "msg": "success", "data": {"dates": dates, "counts": counts}}

@router.get("/task_trend")
def get_task_trend(days: int = 7, db: Session = Depends(get_db)):
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    dates = []
    counts = []
    
    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date.strftime("%Y-%m-%d"))
        count = db.query(Task).filter(
            Task.is_completed == True,
            Task.date == current_date
        ).count()
        counts.append(count)
        current_date += timedelta(days=1)
    
    return {"code": 200, "msg": "success", "data": {"dates": dates, "counts": counts}}

@router.get("/users")
def get_users(page: int = 1, size: int = 10, db: Session = Depends(get_db)):
    skip = (page - 1) * size
    # 直接使用SQL查询以获取正确的字段顺序
    users = db.execute(
        text("SELECT id, nickname, email, phone FROM users WHERE is_admin = 0 ORDER BY id LIMIT :limit OFFSET :skip"),
        {"limit": size, "skip": skip}
    ).fetchall()
    
    total = db.query(User).filter(User.is_admin == False).count()
    
    user_list = []
    for user in users:
        user_list.append({
            "id": user[0],
            "nickname": user[1],
            "email": user[2],
            "phone": user[3]
        })
    
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "users": user_list,
            "total": total,
            "page": page,
            "size": size
        }
    }

@router.put("/users/{user_id}")
def update_user_admin(user_id: str, nickname: str = None, phone: str = None, email: str = None, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    if phone and db.query(User).filter(User.phone == phone, User.id != user_id).first():
        return {"code": 400, "msg": "该手机号已被使用", "data": None}
    
    if email and db.query(User).filter(User.email == email, User.id != user_id).first():
        return {"code": 400, "msg": "该邮箱已被使用", "data": None}
    
    if nickname is not None:
        db_user.nickname = nickname
    if phone:
        db_user.phone = phone
    if email:
        db_user.email = email
    
    db.commit()
    db.refresh(db_user)
    
    return {"code": 200, "msg": "更新成功", "data": None}

@router.delete("/users/{user_id}")
def delete_user_admin(user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    if db_user.is_admin:
        return {"code": 400, "msg": "不能删除管理员", "data": None}
    
    db.delete(db_user)
    db.commit()
    
    return {"code": 200, "msg": "删除成功", "data": None}