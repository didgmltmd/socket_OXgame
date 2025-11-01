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

      {Object.values(state.players)
        .filter((p) => p.alive && !p.spectator)
        .map((p) => (
          <div
            key={p.id}
            className="absolute w-4 h-4 rounded-full bg-blue-500"
            style={{ left: p.x, top: p.y }}
          >
            {p.name}
          </div>
        ))}
    </div>
  );
}
