import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

export default function Landing() {
  const [name, setName] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const onState = () => {
      console.log("[Landing] state 수신 → /lobby 이동");
      nav("/lobby");
    };
    const onErr = (e: any) => console.error("[Landing] server error:", e);

    socket.on("state", onState);
    socket.on("error", onErr);
    return () => {
      socket.off("state", onState);
      socket.off("error", onErr);
    };
  }, [nav]);

  const onJoin = () => {
    if (!name.trim()) return;

    const doJoin = () => {
      console.log("[Landing] join emit");
      socket.emit("join", { name });

      socket.timeout(2000).emit("getState", (err: any, s: any) => {
        if (err) {
          console.warn("[Landing] getState timeout/err:", err);
          return;
        }
        if (s) {
          console.log("[Landing] getState 스냅샷 수신 → /lobby 이동");
          nav("/lobby");
        }
      });
    };

    if (!socket.connected) {
      console.log("[Landing] socket 재연결 시도");
      socket.connect();
      socket.once("connect", doJoin);
    } else {
      doJoin();
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">O/X 퀴즈쇼</h1>
        <input
          className="w-full border rounded p-3"
          placeholder="닉네임"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn w-full" onClick={onJoin}>
          참여하기
        </button>
      </div>
    </div>
  );
}
