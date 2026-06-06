# 同途打卡

## 项目简介

同途打卡是一款基于 React + FastAPI 的打卡互助系统，包含管理端和用户端，支持任务管理、好友互动、日记分享等功能。

## 技术栈

### 前端
- React 18 + TypeScript
- MUI (Material UI) 5
- React Router 6
- Axios
- Recharts

### 后端
- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite
- bcrypt (密码加密)
- python-multipart (文件上传)

## 项目结构

```
Tongtudaka/
├── backend/           # 后端代码
│   ├── db/            # SQLite数据库目录
│   ├── routers/       # API路由
│   │   ├── auth.py    # 用户认证接口
│   │   ├── admin.py   # 管理端接口
│   │   └── user.py    # 用户端接口
│   ├── uploads/       # 上传文件目录
│   │   ├── avatars/   # 用户头像
│   │   └── backgrounds/  # 背景图片
│   ├── main.py        # 项目入口
│   ├── models.py      # 数据库模型
│   ├── schemas.py     # 数据模型
│   └── requirements.txt
├── frontend/          # 前端代码
│   ├── public/        # 静态资源
│   ├── src/
│   │   ├── api/       # API封装
│   │   ├── components/# 公共组件
│   │   ├── context/   # 状态管理
│   │   ├── pages/     # 页面组件
│   │   ├── utils/     # 工具函数
│   │   ├── App.tsx    # 应用入口
│   │   ├── theme.ts   # MUI主题配置
│   │   └── index.tsx  # React入口
│   └── package.json
└── README.md
```

## 功能特性

### 用户端功能
- **用户注册与登录**：支持手机号、邮箱注册，自动分配用户ID
- **个人主页**：支持上传头像和背景图，展示用户基本信息
- **搭子管理**：添加好友、查看搭子列表、发送搭子申请
- **互督打卡**：创建每日任务、完成任务打卡、查看搭子任务进度
- **互督日记**：发布图文日记、点赞评论、与搭子分享动态
- **数据统计**：查看今日打卡进度、历史完成率等统计数据

### 管理端功能
- **数据总览**：查看用户总数、今日活跃用户、任务完成统计
- **趋势图表**：用户增长趋势图、任务完成趋势图
- **用户管理**：查看用户列表、编辑用户信息、删除用户

## 安装与运行

### 环境要求
- Node.js 16+
- Python 3.10+
- npm 或 yarn

### 后端安装

```bash
cd backend
pip install -r requirements.txt
```

### 后端启动

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

后端服务地址：http://localhost:8000

### 前端安装

```bash
cd frontend
npm install
```

### 前端启动

```bash
cd frontend
npm start
```

前端服务地址：http://localhost:3000

## 默认账号

### 管理员账号
- ID：202600000
- 密码：123456

### 普通用户
- 首次注册后自动生成唯一ID
- 初始密码由用户设置

## API接口

### 用户认证 (/api)
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/user/{user_id}` - 获取用户信息
- `PUT /api/user/{user_id}` - 更新用户信息
- `POST /api/upload/avatar` - 上传头像
- `POST /api/upload/background` - 上传背景图

### 用户功能 (/api/user)
- `GET /api/user/friends` - 获取搭子列表
- `POST /api/user/friends` - 添加搭子
- `PUT /api/user/friends/{id}` - 更新搭子状态
- `GET /api/user/tasks` - 获取任务列表
- `POST /api/user/tasks` - 创建任务
- `PUT /api/user/tasks/{id}` - 更新任务
- `DELETE /api/user/tasks/{id}` - 删除任务
- `GET /api/user/stats` - 获取用户统计
- `GET /api/user/diaries` - 获取日记列表
- `POST /api/user/diaries` - 发布日记
- `POST /api/user/diaries/{id}/like` - 点赞
- `POST /api/user/diaries/{id}/comment` - 评论

### 管理端 (/api/admin)
- `GET /api/admin/stats` - 获取统计信息
- `GET /api/admin/user_trend` - 用户趋势
- `GET /api/admin/task_trend` - 任务趋势
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/{user_id}` - 更新用户信息
- `DELETE /api/admin/users/{user_id}` - 删除用户

## 数据库

数据库文件位于 `backend/db/tongtu.db`，使用 SQLite 存储。

### 主要数据表
- `users` - 用户信息表
- `tasks` - 任务表
- `friends` - 搭子关系表
- `diaries` - 日记表
- `likes_comments` - 点赞评论表

## 注意事项

1. 首次运行会自动创建数据库表
2. 上传的头像和背景图存储在 `backend/uploads/` 目录
3. 生产环境请修改默认管理员密码
4. 建议使用 Chrome 或 Firefox 浏览器访问