import { useRef, useEffect } from "react";

export function AudioVisualiser(props: {
  audioData: Uint8Array;
  className?: string;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef(0);

  useEffect(() => {
    const draw = () => {
      if (canvas.current) {
        const height = canvas.current.height;
        const width = canvas.current.width;
        const context = canvas.current.getContext(
          "2d",
        ) as CanvasRenderingContext2D;
        let x = 0;
        const sliceWidth = width / props.audioData.length;

        context.lineWidth = 2;
        context.strokeStyle = props.strokeStyle ?? "#000000";
        context.clearRect(0, 0, width, height);

        context.beginPath();
        context.moveTo(0, height / 2);
        for (const item of props.audioData) {
          const y = (item / 255.0) * height;
          context.lineTo(x, y);
          x += sliceWidth;
        }
        context.lineTo(x, height / 2);
        context.stroke();
      }
      rafIdRef.current = requestAnimationFrame(draw);
    };
    rafIdRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [props.audioData, props.strokeStyle]);

  return (
    <canvas
      width="300"
      height="100"
      className={`${props.className ?? ""}`}
      ref={canvas}
    />
  );
}
