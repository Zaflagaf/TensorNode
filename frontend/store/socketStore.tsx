import { io } from "socket.io-client";
import { create } from "zustand";

const BACKEND_URL = "http://localhost:8000"; //process.env.NEXT_PUBLIC_BACKEND_URL!;

const socket = io(BACKEND_URL, {
  path: "/api/socket.io",
});

export const useSocketStore = create<{ socket: ReturnType<typeof io> }>(
  (set) => ({
    socket: socket,
  })
);
