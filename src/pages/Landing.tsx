import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

export default function Landing() {
  const nav = useNavigate();

  useEffect(() => {
    const onState = () => {
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

  const generateRandomKoreanName = () => {
    const adjectives = [
      "귀여운",
      "빠른",
      "용감한",
      "똑똑한",
      "행복한",
      "멋진",
      "깜찍한",
      "즐거운",
      "당당한",
      "튼튼한",
    ];

    const animals = [
      "강아지",
      "고양이",
      "토끼",
      "호랑이",
      "판다",
      "여우",
      "사자",
      "곰돌이",
      "펭귄",
      "돌고래",
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const ani = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(100 + Math.random() * 900);

    return `${adj}${ani}${num}`;
  };

  const onJoin = () => {
    const name = generateRandomKoreanName();
    
    const doJoin = () => {
      socket.emit("join", { name });

      socket.timeout(2000).emit("getState", (err: any, s: any) => {
        if (err) return console.warn("[Landing] getState timeout/err:", err);
        if (s) nav("/lobby");
      });
    };

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", doJoin);
    } else {
      doJoin();
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-20">O/X 퀴즈쇼</h1>
        <button className="btn w-full border-2" onClick={onJoin}>
          참여하기
        </button>
      </div>
    </div>
  );
}
