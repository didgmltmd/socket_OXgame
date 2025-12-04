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

  const allPlayers = Object.values(state.players);
  const meId = socket.id;
  const me = meId ? state.players[meId] : undefined;
  const others = me ? allPlayers.filter((p) => p.id !== me.id) : allPlayers;

  const allReady = allPlayers.length >= 2 && allPlayers.every((p) => p.ready);

  return (
    <div className="min-h-dvh max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* 헤더 */}
      <h2 className="text-lg md:text-xl font-bold">
        대기실
        <span className="ml-1 text-sm font-normal text-gray-500">
          ({allPlayers.length}명 접속 중)
        </span>
      </h2>

      {/* 내 정보 + 준비 버튼 (모바일/PC 레이아웃 분리) */}
      <div className="border rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-white/70">
        <div className="flex-1 text-sm md:text-base">
          <div className="flex items-baseline gap-1">
            <span className="text-gray-500">내 닉네임</span>
            <span className="text-xs text-gray-400">/ Me</span>
          </div>
          <div className="mt-0.5 font-semibold truncate">
            {me?.name ?? "알 수 없음"}
          </div>
          {me && (
            <div
              className={`mt-1 text-xs md:text-sm ${
                me.ready ? "text-green-600" : "text-gray-500"
              }`}
            >
              상태: {me.ready ? "Ready" : "Not ready"}
            </div>
          )}
        </div>

        <button
          className="btn w-full md:w-auto md:min-w-[120px] py-2 border border-gray-300"
          onClick={() => socket.emit("ready")}
        >
          준비 완료
        </button>
      </div>

      {/* 다른 플레이어 목록 */}
      {others.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            다른 플레이어
            <span className="ml-1 text-xs text-gray-400">
              ({others.length}명)
            </span>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {others.map((p) => (
              <li
                key={p.id}
                className="border rounded-lg p-2 flex items-center justify-between bg-white/60"
              >
                <span className="text-sm truncate">{p.name}</span>
                <span
                  className={`text-xs md:text-sm ${
                    p.ready ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {p.ready ? "Ready" : "Not ready"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {allReady && (
        <p className="text-sm md:text-base text-primary">
          모두 준비 완료! 곧 게임이 시작됩니다…
        </p>
      )}
    </div>
  );
}
