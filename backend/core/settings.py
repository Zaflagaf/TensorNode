from dotenv import load_dotenv
import os

load_dotenv()

FRONTEND_URL = os.environ.get("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.environ.get("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000")

ORIGINS = [ "*" ]