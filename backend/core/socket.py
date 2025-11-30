import socketio

sio = socketio.AsyncServer(
    cors_allowed_origins="*", 
    async_mode="asgi", 
    socketio_path="/api/socket.io"
)
sio_app = None

def init_socket_app(app):
    global sio_app

    sio_app = socketio.ASGIApp(sio, app, socketio_path="/api/socket.io")

    return sio, sio_app