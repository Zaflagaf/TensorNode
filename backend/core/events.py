from socketio import AsyncServer
from backend.core.caches import cache
import asyncio

def register_socket_events(sio: AsyncServer):

    @sio.event
    async def connect(sid, environ):
        print("Client successfully connected:", sid)

    @sio.event
    async def disconnect(sid):
        print("Client disconnected from server:", sid)

    

        """ @sio.event
        async def state(sid, data):
            print(f"Événement reçu : {data}")
            
            if data == "pause":
                state["paused"] = not state["paused"]
            elif data == "stop":
                state.update(running=False, paused=False) """
        """         
        if data == "start":
            if not state["running"]:
                state.update(running=True, paused=False, progress=0)
                asyncio.create_task(loop_process(sid)) """