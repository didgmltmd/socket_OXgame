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

  return (
    <div
      className="relative border rounded-xl overflow-hidden mx-auto"
      style={{ width: WIDTH, height: HEIGHT }}
    >
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
              <div className="-mt-1 px-1 bg-white/80 rounded shadow text-[10px] whitespace-nowrap">
                {p.name}
              </div>
            </div>
          );
        })}
    </div>
  );
}
