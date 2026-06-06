import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 加密密码
hashed_password = pwd_context.hash("123456")

# 连接数据库
conn = sqlite3.connect('./db/tongtu.db')
cursor = conn.cursor()

# 检查管理员是否已存在
cursor.execute('SELECT id FROM users WHERE id = ?', ('202600000',))
existing_user = cursor.fetchone()

if existing_user:
    # 更新现有用户为管理员
    cursor.execute('''
        UPDATE users 
        SET password = ?, is_admin = 1 
        WHERE id = ?
    ''', (hashed_password, '202600000'))
    print("已更新用户 202600000 为管理员")
else:
    # 创建新管理员账号
    cursor.execute('''
        INSERT INTO users (id, password, is_admin)
        VALUES (?, ?, 1)
    ''', ('202600000', hashed_password))
    print("已创建管理员账号：ID=202600000")

conn.commit()
conn.close()