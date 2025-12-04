import { useEffect, useRef, useState } from "react";

const WIDTH = 800;
const HEIGHT = 400;

type Props = {
  state: {
    players: Record<
      string,
      {
        id: string;
        name: string;
        x: number;
        y: number;
        alive: boolean;
        spectator: boolean;
      }
    >;
  };
  positions: Record<string, { x: number; y: number }>;
  result: { correct: "O" | "X"; eliminated: string[] } | null;
  myId?: string; // ✅ 내 플레이어 id 추가
};

export default function Field({ state, positions, result, myId }: Props) {
  const players = Object.values(state.players);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const scaleX = rect.width / WIDTH;
      const scaleY = rect.height / HEIGHT;
      // 둘 중 작은 값으로 스케일 (전체 경기장 보이게)
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[800px]"
      style={{
        // 비율 유지 (2:1)
        aspectRatio: `${WIDTH}/${HEIGHT}`,
      }}
    >
      {/* 실제 경기장은 800x400 고정, 대신 scale로 줄이기 */}
      <div
        className="absolute top-0 left-0 origin-top-left border rounded-xl overflow-hidden"
        style={{
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {/* O / X 영역 배경 */}
        <div className="absolute inset-0 grid grid-cols-2">
          <div
            className={`flex items-start p-2 ${
              result?.correct === "O" ? "animate-pulse" : ""
            }`}
            style={{ background: "#ecfdf5" }}
          >
            O
          </div>
          <div
            className={`flex items-start p-2 ${
              result?.correct === "X" ? "animate-pulse" : ""
            }`}
            style={{ background: "#fee2e2" }}
          >
            X
          </div>
        </div>

        {/* 중앙 구분선 */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/20" />

        {/* 플레이어들 (좌표 로직 그대로) */}
        {players
          .filter((p) => p.alive && !p.spectator)
          .map((p) => {
            const pos = positions[p.id] ?? { x: p.x, y: p.y };
            const isMe = myId && p.id === myId; // ✅ 나인지 체크

            return (
              <div
                key={p.id}
                className="absolute text-center"
                style={{
                  left: pos.x - 8,
                  top: pos.y - 8,
                  zIndex: isMe ? 20 : 10, // 내가 위에 보이게
                }}
              >
                {/* 동그라미 색 / 크기 변경 */}
                <div
                  className={
                    "rounded-full " +
                    (isMe
                      ? "w-5 h-5 bg-blue-500 ring-2 ring-blue-200"
                      : "w-4 h-4 bg-black/70")
                  }
                />
                {/* 이름 태그 */}
                <div
                  className={
                    "-mt-1 inline-flex items-center gap-1 px-1 bg-white/80 rounded shadow text-[15px] whitespace-nowrap " +
                    (isMe ? "border border-blue-300" : "")
                  }
                >
                  {isMe && (
                    <span className="px-1 py-[1px] rounded bg-blue-500 text-white text-[10px]">
                      나
                    </span>
                  )}
                  <span>{p.name}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
