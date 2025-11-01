import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";


export default function Landing() {
const [name, setName] = useState("");
const nav = useNavigate();


useEffect(() => {
const onState = () => nav("/lobby");
socket.on("state", onState); // 서버가 상태를 보내면 대기실로 이동
return () => socket.off("state", onState);
}, [nav]);


const onJoin = () => {
if (!name.trim()) return;
socket.emit("join", { name });
};


return (
<div className="min-h-dvh grid place-items-center p-6">
<div className="card w-full max-w-md p-6 space-y-4">
<h1 className="text-2xl font-bold">O/X 퀴즈쇼</h1>
<input
className="w-full border rounded p-3"
placeholder="닉네임"
value={name}
onChange={(e)=>setName(e.target.value)}
/>
<button className="btn w-full" onClick={onJoin}>참여하기</button>
</div>
</div>
);
}