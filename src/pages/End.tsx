import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

type Player = { id: string; name: string };
type RoomState = {
  players: Record<string, Player>;
  winners: string[];
  phase?: string;
};

export default function End() {
  const [names, setNames] = useState<string[]>([]);
  const [myName, setMyName] = useState<string | null>(null); 
  const lockedRef = useRef(false);
  const nav = useNavigate();

  useEffect(() => {
    const setFinalWinners = (winnerNames: string[]) => {
      if (lockedRef.current) return;
      if (winnerNames && winnerNames.length) {
        setNames(winnerNames);
        lockedRef.current = true;
        setTimeout(() => {
          try {
            socket.disconnect();
          } catch {}
        }, 200);
      }
    };

    const onEnd = (p: { winnerIds: string[]; winners: string[] }) => {
      setFinalWinners(p.winners);
    };

    const onState = (s: RoomState) => {
      const sid = socket.id;
      if (sid) {
        const me = s.players?.[sid];
        if (me?.name) {
          setMyName(me.name);
        }
      }

      if (lockedRef.current) return;

      if (Array.isArray(s?.winners)) {
        const mapped = s.winners.map((id) => s.players?.[id]?.name ?? id);
        setFinalWinners(mapped);
      }
    };
    
    socket.on("end", onEnd);
    socket.on("state", onState);

    socket.timeout(2000).emit("getState", (err: any, s: RoomState) => {
      if (!err && s) onState(s);
    });

    return () => {
      socket.off("end", onEnd);
      socket.off("state", onState);
    };
  }, []);

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="card p-6 w-full max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">게임 종료</h2>

        {myName && (
          <p className="text-sm text-gray-600">
            내 닉네임: <b>{myName}</b>
          </p>
        )}

        {names.length === 0 && <p>무승부!</p>}

        {names.length === 1 && (
          <p>
            우승자: <b>{names[0]}</b>
          </p>
        )}

        {names.length > 1 && (
          <div>
            <p>공동 우승 !!</p>
            <ul className="mt-2 space-y-1">
              {names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn w-full" onClick={() => nav("/")}>
          처음으로
        </button>
      </div>
    </div>
  );
}
