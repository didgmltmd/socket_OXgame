// src/components/Joystick.tsx
import { useCallback, useRef, useState } from "react";

type JoystickProps = {
  onDirectionChange: (dir: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }) => void;
};

export function Joystick({ onDirectionChange }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 }); // -1 ~ 1
  const draggingRef = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return;

      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = clientX - cx;
      const dy = clientY - cy;

      const maxR = rect.width / 2; // 원 반지름
      let nx = dx / maxR;
      let ny = dy / maxR;

      // 최대 반지름 밖으로는 못 나가게 클램핑
      const len = Math.sqrt(nx * nx + ny * ny);
      if (len > 1) {
        nx /= len;
        ny /= len;
      }

      setKnobPos({ x: nx, y: ny });

      const threshold = 0.35; // 어느 정도 이상 움직였을 때만 방향 인식
      const dir = {
        up: ny < -threshold,
        down: ny > threshold,
        left: nx < -threshold,
        right: nx > threshold,
      };

      onDirectionChange(dir);
    },
    [onDirectionChange]
  );

  const reset = useCallback(() => {
    setKnobPos({ x: 0, y: 0 });
    onDirectionChange({ up: false, down: false, left: false, right: false });
  }, [onDirectionChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = false;
    reset();
  };

  return (
    <div
      ref={baseRef}
      className="relative w-28 h-28 rounded-full bg-black/30 border border-white/30 touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={(e) => {
        // 손가락이 밖으로 나갔을 때도 처리
        if (draggingRef.current) {
          handlePointerUp(e as any);
        }
      }}
    >
      {/* 센터 표시 */}
      <div className="absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />

      {/* 손잡이(움직이는 동그라미) */}
      <div
        className="absolute w-10 h-10 rounded-full bg-white/90 shadow-lg -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${50 + knobPos.x * 40}%`, // 40% 정도 범위 안에서만 움직이게
          top: `${50 + knobPos.y * 40}%`,
        }}
      />
    </div>
  );
}
