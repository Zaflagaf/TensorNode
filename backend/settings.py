import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(BASE_DIR)
UPLOAD_DIR = os.path.join(BASE_DIR, "temp")