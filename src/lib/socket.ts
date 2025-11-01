import { io, Socket } from "socket.io-client";


// 서버 주소는 Vite 환경변수로 관리
export const socket: Socket = io(import.meta.env.VITE_WS_URL, {
autoConnect: true,
});