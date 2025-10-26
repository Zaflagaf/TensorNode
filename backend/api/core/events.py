from socketio import AsyncServer

def register_socket_events(sio: AsyncServer):

    @sio.event
    async def connect(sid, environ):
        print("Client successfully connected:", sid)

    @sio.event
    async def disconnect(sid):
        print("Client disconnected from server:", sid)