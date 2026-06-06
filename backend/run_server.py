import subprocess
import sys

if __name__ == "__main__":
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    subprocess.run(cmd, cwd="d:\\Tongtudaka\\backend")