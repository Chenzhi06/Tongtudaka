import sqlite3
import os

db_path = "./db/tongtu.db"

if not os.path.exists(db_path):
    print("数据库文件不存在，将在启动时自动创建")
    exit(0)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查 users 表是否存在
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
if not cursor.fetchone():
    print("users 表不存在，将在启动时自动创建")
    conn.close()
    exit(0)

# 检查是否已经有 nickname 列
cursor.execute("PRAGMA table_info(users)")
columns = [col[1] for col in cursor.fetchall()]

if 'nickname' in columns:
    print("nickname 列已存在，无需迁移")
    conn.close()
    exit(0)

print("开始迁移 users 表，添加 nickname 字段...")

# 添加 nickname 列
cursor.execute("ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT ''")

conn.commit()
conn.close()

print("迁移完成！users 表已添加 nickname 字段")