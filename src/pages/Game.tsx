import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import { Joystick } from "../components/Joystick";
import Field from "../components/Field";

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  alive: boolean;
  spectator: boolean;
}
interface RoomState {
  phase: string;
  players: Record<string, Player>;
  countdown: number;
  questionIndex: number;
}

function sendInput(dir: "up" | "down" | "left" | "right", pressed: boolean) {
  socket.emit("input", { [dir]: pressed });
}

export default function Game() {
  const [state, setState] = useState<RoomState | null>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const joyDirRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const handleJoystickChange = (dir: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }) => {
    const prev = joyDirRef.current;

    // 바뀐 방향만 socket.emit 보내기
    (["up", "down", "left", "right"] as const).forEach((k) => {
      if (prev[k] !== dir[k]) {
        sendInput(k, dir[k]);
      }
    });

    joyDirRef.current = dir;
  };

  const phaseRef = useRef<string | undefined>(state?.phase);
  useEffect(() => {
    phaseRef.current = state?.phase;
  }, [state?.phase]);
  const [question, setQuestion] = useState<{ id: number; text: string } | null>(
    null
  );
  const [result, setResult] = useState<{
    correct: "O" | "X";
    eliminated: string[];
  } | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onState = (s: RoomState) => {
      console.log("[Game] state:", s);
      setState(s);
      // 게임 상태가 아니면 로비로 복귀 (직접 접근 방지)
      if (s.phase === "LOBBY") nav("/lobby");
      if (s.phase === "END") nav("/end");
    };

    const onTick = ({
      players,
      countdown,
      phase,
    }: {
      players: Array<{ id: string; x: number; y: number }>;
      countdown?: number;
      phase?: string;
    }) => {
      setPositions((prev) => {
        const next = { ...prev };
        for (const p of players) next[p.id] = { x: p.x, y: p.y };
        return next;
      });
      if (countdown !== undefined || phase !== undefined) {
        setState((prev) =>
          prev
            ? {
                ...prev,
                countdown: countdown ?? prev.countdown,
                phase: phase ?? prev.phase,
              }
            : prev
        );
      }
    };

    const onPhase = ({ phase }: { phase: string }) => {
      console.log("[Game] phase:", phase);
      if (phase === "END") nav("/end");
      if (phase === "QUESTION") setResult(null);
    };


    const onQuestion = (q: { id: number; text: string }) => {
      setQuestion(q);
    };


    const onResult = (r: { correct: "O" | "X"; eliminated: string[] }) => {
      setResult(r);
    };


    const onEnd = () => nav("/end");

    socket.on("state", onState);
    socket.on("tick", onTick);
    socket.on("phase", onPhase);
    socket.on("question", onQuestion);
    socket.on("result", onResult);
    socket.on("end", onEnd);

    socket.timeout(2000).emit("getState", (err: any, s: RoomState) => {
      if (err) {
        console.warn("[Game] getState timeout/err:", err);
      } else if (s) {
        console.log("[Game] getState snapshot:", s);
        setState(s);
        if (s.phase === "LOBBY") nav("/lobby");
        if (s.phase === "END") nav("/end");
      }
    });

    return () => {
      socket.off("state", onState);
      socket.off("tick", onTick);
      socket.off("phase", onPhase);
      socket.off("question", onQuestion);
      socket.off("result", onResult);
      socket.off("end", onEnd);
    };
  }, [nav]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          sendInput("up", true);
          break;
        case "KeyS":
          sendInput("down", true);
          break;
        case "KeyA":
          sendInput("left", true);
          break;
        case "KeyD":
          sendInput("right", true);
          break;
      }
    };

    const ku = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          sendInput("up", false);
          break;
        case "KeyS":
          sendInput("down", false);
          break;
        case "KeyA":
          sendInput("left", false);
          break;
        case "KeyD":
          sendInput("right", false);
          break;
      }
    };

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  if (!state) return <div className="p-6">게임 로딩…</div>;

  const sid = socket.id;
  let myPlayer = undefined;

  if (sid && state.players[sid]) {
    myPlayer = state.players[sid];
  }

  const isDead = myPlayer && !myPlayer.alive;

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          {state.phase === "QUESTION"
            ? `문제 ${state.questionIndex + 1}/10`
            : state.phase === "STARTING"
            ? "곧 시작!"
            : " "}
        </div>
        <div className="text-2xl font-bold tabular-nums">
          {Math.max(0, Math.ceil(state.countdown))}s
        </div>
      </header>

      {isDead && (
        <div className="text-center bg-red-100 text-red-600 font-semibold rounded-lg py-2">
          💀 탈락하셨습니다! 관전모드입니다 💀
        </div>
      )}

      {question && <div className="text-lg font-medium">{question.text}</div>}
      <Field
        state={state}
        positions={positions}
        result={result}
        myId={socket.id ?? undefined}
      />

      {result && (
        <div className="text-sm">
          정답: <b>{result.correct}</b> — 탈락 {result.eliminated.length}명
        </div>
      )}

      <div className="fixed left-4 bottom-4 md:hidden z-50">
        <Joystick onDirectionChange={handleJoystickChange} />
      </div>

      
    </div>
  );
}
