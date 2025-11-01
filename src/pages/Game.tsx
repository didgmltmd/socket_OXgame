import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Field from "../components/Field";


interface Player { id: string; name: string; x: number; y: number; alive: boolean; spectator: boolean; }
interface RoomState { phase: string; players: Record<string, Player>; countdown: number; questionIndex: number; }


export default function Game() {
const [state, setState] = useState<RoomState | null>(null);
const [positions, setPositions] = useState<Record<string, {x:number;y:number}>>({});
const [question, setQuestion] = useState<{ id: number; text: string } | null>(null);
const [result, setResult] = useState<{ correct: "O"|"X"; eliminated: string[] } | null>(null);
const nav = useNavigate();


useEffect(() => {
const onState = (s: RoomState) => setState(s);
const onTick = ({ players }: { players: Array<{id:string;x:number;y:number}> }) => {
setPositions(prev => {
const next = { ...prev } as Record<string, {x:number;y:number}>;
for (const p of players) next[p.id] = { x: p.x, y: p.y };
return next;
});
};
const onPhase = ({ phase }: { phase: string }) => {
if (phase === "END") nav("/end");
if (phase === "QUESTION") setResult(null);
};
const onQuestion = (q: { id: number; text: string }) => setQuestion(q);
const onResult = (r: { correct: "O"|"X"; eliminated: string[] }) => setResult(r);
const onEnd = () => nav("/end");


socket.on("state", onState);
socket.on("tick", onTick);
socket.on("phase", onPhase);
socket.on("question", onQuestion);
socket.on("result", onResult);
socket.on("end", onEnd);


return () => {
socket.off("state", onState);
socket.off("tick", onTick);
socket.off("phase", onPhase);
socket.off("question", onQuestion);
socket.off("result", onResult);
socket.off("end", onEnd);
};
}, [nav]);


// WASD 입력
useEffect(() => {
const kd = (e: KeyboardEvent) => {
if (state?.phase !== "QUESTION") return;
if (e.key === "w") socket.emit("input", { up: true });
if (e.key === "s") socket.emit("input", { down: true });
if (e.key === "a") socket.emit("input", { left: true });
if (e.key === "d") socket.emit("input", { right: true });
};
const ku = (e: KeyboardEvent) => {
if (e.key === "w") socket.emit("input", { up: false });
if (e.key === "s") socket.emit("input", { down: false });
if (e.key === "a") socket.emit("input", { left: false });
if (e.key === "d") socket.emit("input", { right: false });
};
window.addEventListener("keydown", kd);
window.addEventListener("keyup", ku);
return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
}, [state?.phase]);


if (!state) return <div className="p-6">게임 로딩…</div>;


return (
<div className="p-4 space-y-4">
<header className="flex items-center justify-between">
<div className="text-lg font-semibold">문제 {state.questionIndex + 1}/10</div>
<div className="text-2xl font-bold tabular-nums">{Math.max(0, Math.ceil(state.countdown))}s</div>
</header>


<Field state={state} positions={positions} result={result} />


{question && (
<div className="text-lg font-medium">{question.text}</div>
)}


{result && (
<div className="text-sm">정답: <b>{result.correct}</b> — 탈락 {result.eliminated.length}명</div>
)}
</div>
);
}