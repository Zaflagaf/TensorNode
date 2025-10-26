# core
from api.core.app import create_app
from api.core.socket import init_socket_app
from api.core.events import register_socket_events

from api.core.settings import ORIGINS
import os
import sys
from pathlib import Path

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
sys.path.append(str(Path(__file__).parent.parent.resolve()))

# routes
from api.routes import upload_routes, model_routes, misc_routes

app = create_app(cors_origins=ORIGINS)
sio, sio_app = init_socket_app(app)

register_socket_events(sio)

app.include_router(upload_routes.router, prefix="/api")
app.include_router(model_routes.router, prefix="/api")
app.include_router(misc_routes.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    print("Starting backend...")

    uvicorn.run(
        "api.main:sio_app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )