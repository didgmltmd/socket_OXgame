import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

interface Player {
  id: string;
  name: string;
  ready: boolean;
  spectator: boolean;
  alive: boolean;
}
interface RoomState {
  phase: string;
  players: Record<string, Player>;
  countdown: number;
  questionIndex: number;
}

export default function Lobby() {
  const [state, setState] = useState<RoomState | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onState = (s: RoomState) => {
      setState(s);
    };
    const onPhase = ({ phase }: { phase: string }) => {
      if (phase === "STARTING" || phase === "QUESTION") nav("/game");
    };

    socket.on("state", onState);
    socket.on("phase", onPhase);

    socket.timeout(2000).emit("getState", (err: any, s: RoomState) => {
      if (err) {
        console.warn("[Lobby] getState timeout/err:", err);
        return;
      }
      setState(s);
    });

    return () => {
      socket.off("state", onState);
      socket.off("phase", onPhase);
    };
  }, [nav]);

  if (!state) return <div className="p-6">대기실 입장 중…</div>;

  const players = Object.values(state.players);
  const allReady = players.length >= 2 && players.every((p) => p.ready);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">대기실</h2>
      <ul className="grid grid-cols-2 gap-2">
        {players.map((p) => (
          <li
            key={p.id}
            className="border rounded p-2 flex items-center justify-between"
          >
            <span>{p.name}</span>
            <span
              className={`text-sm ${
                p.ready ? "text-green-600" : "text-gray-500"
              }`}
            >
              {p.ready ? "Ready" : "Not ready"}
            </span>
          </li>
        ))}
      </ul>
      <button className="btn" onClick={() => socket.emit("ready")}>
        준비 완료
      </button>
      {allReady && (
        <p className="text-primary">모두 준비 완료! 곧 시작합니다…</p>
      )}
    </div>
  );
}
