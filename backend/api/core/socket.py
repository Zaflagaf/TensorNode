import socketio

# Juste une déclaration vide pour l’instant
""" sio: AsyncServer | None = None
sio_app: FastAPI | None = None
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
sio_app = None """

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
sio_app = None

def init_socket_app(app):
    global sio_app

    sio_app = socketio.ASGIApp(sio, app)

    return sio, sio_app

""" def create_socket_app(app: FastAPI, cors_origins: List[str] = ["*"]) -> socketio.ASGIApp:
    global sio, sio_app

    sio = socketio.AsyncServer(
        cors_allowed_origins=cors_origins,
        async_mode="asgi"
    )

    sio_app = socketio.ASGIApp(sio, app)

    print(sio, sio_app)
    
    return sio, sio_app """