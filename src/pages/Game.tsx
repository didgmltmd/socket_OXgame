import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
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

export default function Game() {
  const [state, setState] = useState<RoomState | null>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
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
    console.log(
      "[Game] mount, socket.id=",
      socket.id,
      "connected=",
      socket.connected
    );

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
      console.log("[Game] question:", q);
      setQuestion(q);
    };
    const onResult = (r: { correct: "O" | "X"; eliminated: string[] }) => {
      console.log("[Game] result:", r);
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
          socket.emit("input", { up: true });
          break;
        case "KeyS":
          socket.emit("input", { down: true });
          break;
        case "KeyA":
          socket.emit("input", { left: true });
          break;
        case "KeyD":
          socket.emit("input", { right: true });
          break;
      }
    };

    const ku = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          socket.emit("input", { up: false });
          break;
        case "KeyS":
          socket.emit("input", { down: false });
          break;
        case "KeyA":
          socket.emit("input", { left: false });
          break;
        case "KeyD":
          socket.emit("input", { right: false });
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

      <Field state={state} positions={positions} result={result} />

      {question && <div className="text-lg font-medium">{question.text}</div>}

      {result && (
        <div className="text-sm">
          정답: <b>{result.correct}</b> — 탈락 {result.eliminated.length}명
        </div>
      )}
    </div>
  );
}
