from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from main import SessionLocal
from models import User, Task, Friend, Diary, LikeComment
from schemas import TaskCreate, TaskUpdate, FriendRequest, DiaryCreate, DiaryUpdate, CommentCreate, LikeCommentRequest, CommentRequest
from datetime import datetime, date, timedelta, timezone
from sqlalchemy import func, and_

def to_beijing_time(dt):
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    beijing_tz = timezone(timedelta(hours=8))
    return dt.replace(tzinfo=timezone.utc).astimezone(beijing_tz)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/tasks")
def get_tasks(user_id: str, task_date: str = None, db: Session = Depends(get_db)):
    query = db.query(Task).filter(Task.user_id == user_id)
    if task_date:
        try:
            date_obj = datetime.strptime(task_date, "%Y-%m-%d").date()
            query = query.filter(Task.date == date_obj)
        except:
            pass
    tasks = query.all()
    
    task_list = []
    for task in tasks:
        task_list.append({
            "id": task.id,
            "content": task.content,
            "is_completed": task.is_completed,
            "date": str(task.date),
            "create_time": task.create_time
        })
    
    return {"code": 200, "msg": "success", "data": task_list}

@router.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    user_id = task.user_id
    if not user_id:
        return {"code": 400, "msg": "用户ID不能为空", "data": None}
    
    try:
        date_obj = datetime.strptime(task.date, "%Y-%m-%d").date()
    except:
        return {"code": 400, "msg": "日期格式错误", "data": None}
    
    task_count = db.query(Task).filter(Task.user_id == user_id, Task.date == date_obj).count()
    if task_count >= 10:
        return {"code": 400, "msg": "每日任务上限为10个", "data": None}
    
    new_task = Task(
        user_id=user_id,
        content=task.content,
        date=date_obj
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return {
        "code": 200, 
        "msg": "添加成功", 
        "data": {
            "id": new_task.id,
            "content": new_task.content,
            "is_completed": new_task.is_completed,
            "date": str(new_task.date),
            "create_time": new_task.create_time
        }
    }

@router.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        return {"code": 400, "msg": "任务不存在", "data": None}
    
    if task.content is not None:
        db_task.content = task.content
    if task.is_completed is not None:
        db_task.is_completed = task.is_completed
    
    db.commit()
    db.refresh(db_task)
    
    return {
        "code": 200, 
        "msg": "更新成功", 
        "data": {
            "id": db_task.id,
            "content": db_task.content,
            "is_completed": db_task.is_completed,
            "date": db_task.date,
            "create_time": db_task.create_time
        }
    }

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        return {"code": 400, "msg": "任务不存在", "data": None}
    
    db.delete(db_task)
    db.commit()
    
    return {"code": 200, "msg": "删除成功", "data": None}

@router.get("/friends")
def get_friends(user_id: str, db: Session = Depends(get_db)):
    friends = db.query(Friend).filter(
        Friend.user_id == user_id,
        Friend.status == "agreed"
    ).all()
    
    friend_list = []
    for friend in friends:
        user = db.query(User).filter(User.id == friend.friend_id).first()
        if user:
            friend_list.append({
                "id": user.id,
                "nickname": user.nickname or "",
                "email": user.email,
                "phone": user.phone,
                "signature": user.signature,
                "avatar": user.avatar,
                "background": user.background
            })
    
    return {"code": 200, "msg": "success", "data": friend_list}

@router.get("/friend_requests")
def get_friend_requests(user_id: str, db: Session = Depends(get_db)):
    requests = db.query(Friend).filter(
        Friend.friend_id == user_id,
        Friend.status == "pending"
    ).all()
    
    request_list = []
    for req in requests:
        user = db.query(User).filter(User.id == req.user_id).first()
        if user:
            request_list.append({
                "id": req.id,
                "user_id": user.id,
                "email": user.email,
                "phone": user.phone,
                "signature": user.signature,
                "avatar": user.avatar,
                "apply_time": req.apply_time
            })
    
    return {"code": 200, "msg": "success", "data": request_list}

@router.post("/friend_request")
def send_friend_request(request: FriendRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    if not user_id:
        return {"code": 400, "msg": "用户ID不能为空", "data": None}
    
    if user_id == request.friend_id:
        return {"code": 400, "msg": "不能添加自己为好友", "data": None}
    
    existing = db.query(Friend).filter(
        or_(
            and_(Friend.user_id == user_id, Friend.friend_id == request.friend_id),
            and_(Friend.user_id == request.friend_id, Friend.friend_id == user_id)
        )
    ).first()
    
    if existing:
        return {"code": 400, "msg": "已经是好友或申请已发送", "data": None}
    
    friend_user = db.query(User).filter(User.id == request.friend_id).first()
    if not friend_user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    new_request = Friend(
        user_id=user_id,
        friend_id=request.friend_id,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return {"code": 200, "msg": "申请已发送", "data": None}

@router.put("/friend_request/{request_id}")
def accept_friend_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(Friend).filter(Friend.id == request_id).first()
    if not req:
        return {"code": 400, "msg": "申请不存在", "data": None}
    
    req.status = "agreed"
    
    reverse_friend = Friend(
        user_id=req.friend_id,
        friend_id=req.user_id,
        status="agreed"
    )
    db.add(reverse_friend)
    
    db.commit()
    
    return {"code": 200, "msg": "已同意", "data": None}

@router.get("/diaries")
def get_diaries(user_id: str, db: Session = Depends(get_db)):
    friends = db.query(Friend).filter(
        Friend.user_id == user_id,
        Friend.status == "agreed"
    ).all()
    friend_ids = [f.friend_id for f in friends] + [user_id]
    
    diaries = db.query(Diary).filter(Diary.user_id.in_(friend_ids)).order_by(Diary.create_time.desc()).all()
    
    diary_list = []
    for diary in diaries:
        user = db.query(User).filter(User.id == diary.user_id).first()
        like_comments = db.query(LikeComment).filter(
            LikeComment.diary_id == diary.id,
            LikeComment.type == "like"
        ).all()
        likes = len(like_comments)
        likes_list = []
        for like in like_comments:
            like_user = db.query(User).filter(User.id == like.user_id).first()
            likes_list.append({
                "user_id": like.user_id,
                "username": (like_user.nickname or like_user.id) if like_user else ""
            })
        comments = db.query(LikeComment).filter(
            LikeComment.diary_id == diary.id,
            LikeComment.type == "comment"
        ).all()
        
        comment_list = []
        for comment in comments:
            comment_user = db.query(User).filter(User.id == comment.user_id).first()
            comment_list.append({
                "id": comment.id,
                "user_id": comment.user_id,
                "username": (comment_user.nickname or comment_user.id) if comment_user else "",
                "avatar": comment_user.avatar if comment_user else "",
                "content": comment.content,
                "create_time": to_beijing_time(comment.create_time)
            })
        
        diary_list.append({
            "id": diary.id,
            "user_id": diary.user_id,
            "username": (user.nickname or user.id) if user else "",
            "avatar": user.avatar if user else "",
            "content": diary.content,
            "images": diary.images or [],
            "create_time": to_beijing_time(diary.create_time),
            "likes": likes,
            "likes_list": likes_list,
            "comments": comment_list,
            "is_own": diary.user_id == user_id
        })
    
    return {"code": 200, "msg": "success", "data": diary_list}

@router.post("/diaries")
def create_diary(diary: DiaryCreate, db: Session = Depends(get_db)):
    if diary.images and len(diary.images) > 9:
        return {"code": 400, "msg": "图片数量不能超过9张", "data": None}
    
    new_diary = Diary(
        user_id=diary.user_id,
        content=diary.content,
        images=diary.images or []
    )
    db.add(new_diary)
    db.commit()
    db.refresh(new_diary)
    
    return {"code": 200, "msg": "发布成功", "data": None}

@router.put("/diaries/{diary_id}")
def update_diary(diary_id: int, diary: DiaryUpdate, db: Session = Depends(get_db)):
    db_diary = db.query(Diary).filter(Diary.id == diary_id).first()
    if not db_diary:
        return {"code": 400, "msg": "日记不存在", "data": None}
    
    if diary.images and len(diary.images) > 9:
        return {"code": 400, "msg": "图片数量不能超过9张", "data": None}
    
    db_diary.content = diary.content
    if diary.images is not None:
        db_diary.images = diary.images
    
    db.commit()
    db.refresh(db_diary)
    
    return {"code": 200, "msg": "更新成功", "data": None}

@router.delete("/diaries/{diary_id}")
def delete_diary(diary_id: int, db: Session = Depends(get_db)):
    db_diary = db.query(Diary).filter(Diary.id == diary_id).first()
    if not db_diary:
        return {"code": 400, "msg": "日记不存在", "data": None}
    
    db.delete(db_diary)
    db.commit()
    
    return {"code": 200, "msg": "删除成功", "data": None}

@router.post("/diaries/{diary_id}/like")
def like_diary(diary_id: int, request: LikeCommentRequest, db: Session = Depends(get_db)):
    existing = db.query(LikeComment).filter(
        LikeComment.diary_id == diary_id,
        LikeComment.user_id == request.user_id,
        LikeComment.type == "like"
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"code": 200, "msg": "已取消点赞", "data": {"liked": False}}
    else:
        new_like = LikeComment(
            diary_id=diary_id,
            user_id=request.user_id,
            type="like"
        )
        db.add(new_like)
        db.commit()
        return {"code": 200, "msg": "点赞成功", "data": {"liked": True}}

@router.post("/diaries/{diary_id}/comment")
def comment_diary(diary_id: int, request: CommentRequest, db: Session = Depends(get_db)):
    new_comment = LikeComment(
        diary_id=diary_id,
        user_id=request.user_id,
        type="comment",
        content=request.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {"code": 200, "msg": "评论成功", "data": None}

@router.get("/stats")
def get_user_stats(user_id: str, db: Session = Depends(get_db)):
    today = datetime.now().date()
    
    today_tasks = db.query(Task).filter(Task.user_id == user_id, Task.date == today).count()
    today_completed = db.query(Task).filter(
        Task.user_id == user_id,
        Task.date == today,
        Task.is_completed == True
    ).count()
    
    total_tasks = db.query(Task).filter(Task.user_id == user_id).count()
    total_completed = db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_completed == True
    ).count()
    
    friend_count = db.query(Friend).filter(
        Friend.user_id == user_id,
        Friend.status == "agreed"
    ).count()
    
    avg_rate = (total_completed / total_tasks * 100) if total_tasks > 0 else 0
    today_rate = (today_completed / today_tasks * 100) if today_tasks > 0 else 0
    
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "today_completed": today_completed,
            "today_total": today_tasks,
            "today_rate": round(today_rate, 1),
            "avg_rate": round(avg_rate, 1),
            "friend_count": friend_count,
            "total_tasks": total_tasks
        }
    }

@router.get("/stats/trend")
def get_user_trend(user_id: str, days: int = 7, db: Session = Depends(get_db)):
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    friends = db.query(Friend).filter(
        Friend.user_id == user_id,
        Friend.status == "agreed"
    ).all()
    friend_ids = [f.friend_id for f in friends]
    
    all_users = [user_id] + friend_ids
    user_names = {}
    for uid in all_users:
        user = db.query(User).filter(User.id == uid).first()
        user_names[uid] = user.nickname if user else uid
    
    dates = []
    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date.strftime("%Y-%m-%d"))
        current_date += timedelta(days=1)
    
    trend_data = {}
    for uid in all_users:
        rates = []
        for d in dates:
            task_date = datetime.strptime(d, "%Y-%m-%d").date()
            total = db.query(Task).filter(Task.user_id == uid, Task.date == task_date).count()
            completed = db.query(Task).filter(
                Task.user_id == uid,
                Task.date == task_date,
                Task.is_completed == True
            ).count()
            rate = (completed / total * 100) if total > 0 else 0
            rates.append(round(rate, 1))
        trend_data[uid] = rates
    
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "dates": dates,
            "user_names": user_names,
            "trend_data": trend_data
        }
    }

from sqlalchemy import or_

@router.get("/search_user")
def search_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_admin == False).first()
    if not user:
        return {"code": 400, "msg": "用户不存在", "data": None}
    
    return {
        "code": 200,
        "msg": "success",
        "data": {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "signature": user.signature,
            "avatar": user.avatar,
            "background": user.background
        }
    }