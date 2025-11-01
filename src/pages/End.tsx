import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";


export default function End() {
const [winners, setWinners] = useState<string[]>([]);
const nav = useNavigate();


useEffect(() => {
const onState = (s: any) => setWinners(s?.winners ?? []);
socket.on("state", onState);
return () => socket.off("state", onState);
}, []);


return (
<div className="min-h-dvh grid place-items-center p-6">
<div className="card p-6 w-full max-w-md space-y-4 text-center">
<h2 className="text-2xl font-bold">게임 종료</h2>
{winners.length === 0 && <p>무승부!</p>}
{winners.length === 1 && <p>우승자: <b>{winners[0]}</b></p>}
{winners.length > 1 && (
<div>
<p>공동 우승 🎉</p>
<ul className="mt-2 space-y-1">
{winners.map(w => <li key={w}>{w}</li>)}
</ul>
</div>
)}
<button className="btn w-full" onClick={() => nav("/")}>처음으로</button>
</div>
</div>
);
}