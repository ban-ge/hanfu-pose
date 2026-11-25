import { useRef, useState } from 'react';
import { Button } from '@heroui/react';
import { RotateCw as IconRotateClockwise, RotateCcw as IconRotate, ZoomIn as IconZoomIn, ZoomOut as IconZoomOut, Undo2 as IconRestore } from 'lucide-react';


export const PreviewImage = ({ src, alt, fitViewport, whiteBackground }: { src: string; alt: string; fitViewport?: boolean; whiteBackground?: boolean }) => {
  const labels = { controls: '图片操作', rotateLeft: '向左旋转', rotateRight: '向右旋转', zoomOut: '缩小', zoomIn: '放大', reset: '复位' };
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const buttonClass = 'size-10 min-w-0 shrink-0 rounded-full bg-transparent p-0 text-white hover:bg-white/15 disabled:opacity-30';
  const reset = () => {
    setScale(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-x-3 top-16 bottom-24 flex items-center justify-center overflow-hidden sm:inset-x-16">
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`preview-photo pointer-events-auto max-h-full max-w-full touch-none select-none rounded-lg object-contain ${whiteBackground ? 'bg-white' : ''} ${fitViewport ? 'size-full' : ''} ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})` }}
          onDoubleClick={reset}
          onPointerDown={event => {
            if (event.button !== 0 || drag.current) return;
            event.preventDefault();
            drag.current = { id: event.pointerId, x: event.clientX - offset.x, y: event.clientY - offset.y };
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={event => {
            if (drag.current?.id !== event.pointerId) return;
            setOffset({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y });
          }}
          onPointerUp={event => {
            if (drag.current?.id === event.pointerId) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
            setDragging(false);
          }}
        />
      </div>
      <div
        role="toolbar"
        aria-label={labels.controls}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/65 px-2 py-1.5 text-white shadow-lg backdrop-blur-md"
      >
        <Button isIconOnly aria-label={labels.rotateLeft} className={buttonClass} onPress={() => setRotation(value => (value - 90) % 360)}>
          <IconRotate size={20} />
        </Button>
        <Button isIconOnly aria-label={labels.rotateRight} className={buttonClass} onPress={() => setRotation(value => (value + 90) % 360)}>
          <IconRotateClockwise size={20} />
        </Button>
        <Button isIconOnly aria-label={labels.zoomOut} className={buttonClass} isDisabled={scale <= 0.25} onPress={() => setScale(value => Math.max(0.25, value - 0.25))}>
          <IconZoomOut size={20} />
        </Button>
        <span className="w-12 text-center text-xs tabular-nums" aria-live="polite">
          {Math.round(scale * 100)}%
        </span>
        <Button isIconOnly aria-label={labels.zoomIn} className={buttonClass} isDisabled={scale >= 4} onPress={() => setScale(value => Math.min(4, value + 0.25))}>
          <IconZoomIn size={20} />
        </Button>
        <Button isIconOnly aria-label={labels.reset} className={buttonClass} onPress={reset}>
          <IconRestore size={20} />
        </Button>
      </div>
    </>
  );
};
