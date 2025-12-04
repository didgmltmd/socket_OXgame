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
};

export default function Field({ state, positions, result }: Props) {
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
            return (
              <div
                key={p.id}
                className="absolute text-center"
                style={{ left: pos.x - 8, top: pos.y - 8 }}
              >
                <div className="w-4 h-4 rounded-full bg-black/70" />
                <div className="-mt-1 px-1 bg-white/80 rounded shadow text-[15px] whitespace-nowrap">
                  {p.name}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
