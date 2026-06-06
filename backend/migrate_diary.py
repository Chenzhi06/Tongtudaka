import sqlite3
import os

db_path = "./db/tongtu.db"

if not os.path.exists(db_path):
    print("数据库文件不存在，将在启动时自动创建")
    exit(0)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查 diaries 表是否存在
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='diaries'")
if not cursor.fetchone():
    print("diaries 表不存在，将在启动时自动创建")
    conn.close()
    exit(0)

# 检查是否已经有 images 列
cursor.execute("PRAGMA table_info(diaries)")
columns = [col[1] for col in cursor.fetchall()]

if 'images' in columns:
    print("images 列已存在，无需迁移")
    conn.close()
    exit(0)

print("开始迁移 diaries 表...")

# 创建新表
cursor.execute("""
CREATE TABLE diaries_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 迁移旧数据
cursor.execute("SELECT id, user_id, content, image, create_time FROM diaries")
old_data = cursor.fetchall()

for row in old_data:
    id, user_id, content, image, create_time = row
    # 将单个 image 转换为 images 数组格式
    if image:
        images = f'["{image}"]'
    else:
        images = '[]'
    cursor.execute("""
        INSERT INTO diaries_new (id, user_id, content, images, create_time)
        VALUES (?, ?, ?, ?, ?)
    """, (id, user_id, content, images, create_time))

# 删除旧表
cursor.execute("DROP TABLE diaries")

# 重命名新表
cursor.execute("ALTER TABLE diaries_new RENAME TO diaries")

conn.commit()
conn.close()

print("迁移完成！diaries 表已更新为支持多图存储")