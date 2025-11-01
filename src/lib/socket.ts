import { io, Socket } from "socket.io-client";

// 서버 주소는 Vite 환경변수로 관리
export const socket: Socket = io("https://socket-oxgame-server.onrender.com", {
  autoConnect: true,
});

socket.on("connect", () => console.log("✅ socket connected", socket.id));
socket.on("connect_error", (err) => console.error("❌ connect_error", err));
socket.on("error", (err) => console.error("❌ server error", err));
