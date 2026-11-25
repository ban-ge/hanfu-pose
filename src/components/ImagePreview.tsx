import { useState } from 'react';
import { useImagePreviewKeys } from './useImagePreviewKeys';
import { Button, Modal } from '@heroui/react';
import { ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight, X as IconX } from 'lucide-react';

import { PreviewImage } from './PreviewImage';

type Props = {
  label?: string;
  fitViewport?: boolean;
  whiteBackground?: boolean;
  images: string[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

export function ImagePreview({ images, index, onIndexChange, label, fitViewport, whiteBackground }: Props) {
  const flow = { referenceImages: '参考图', previousImage: '上一张', nextImage: '下一张' };
  const isOpen = index !== null && Boolean(images[index]);
  const [lastIndex, setLastIndex] = useState(0);
  if (isOpen && index !== lastIndex) setLastIndex(index);
  const shownIndex = index ?? lastIndex;
  const switchImage = (direction: number) => {
    if (index !== null && images.length > 1) onIndexChange((index + direction + images.length) % images.length);
  };
  const keyboardRef = useImagePreviewKeys(isOpen && images.length > 1, switchImage);
  const controlClass = 'z-10 size-11 min-w-0 rounded-full bg-black/30 p-0 text-white hover:bg-black/55';

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onIndexChange(null);
      }}
      className="bg-black/80 backdrop-blur-md"
    >
      <Modal.Container size="full" placement="center">
        <Modal.Dialog aria-label={label ?? flow.referenceImages} className="relative items-center justify-center bg-transparent p-3 text-white shadow-none sm:p-4">
          <div className="absolute inset-0" onClick={() => onIndexChange(null)} aria-hidden="true" />
          <div ref={keyboardRef} className="contents">
            <span className="absolute left-4 top-4 z-10 rounded-full bg-black/30 px-3 py-1.5 text-sm tabular-nums" aria-live="polite" aria-atomic="true">
              {shownIndex + 1} / {images.length}
            </span>
            <Modal.CloseTrigger aria-label={'关闭预览'} className={controlClass} autoFocus>
              <IconX size={22} />
            </Modal.CloseTrigger>
            {images.length > 1 && (
              <>
                <Button isIconOnly aria-label={flow.previousImage} className={`${controlClass} absolute left-3 top-1/2 -translate-y-1/2 sm:left-4`} onPress={() => switchImage(-1)}>
                  <IconChevronLeft size={24} />
                </Button>
                <Button isIconOnly aria-label={flow.nextImage} className={`${controlClass} absolute right-3 top-1/2 -translate-y-1/2 sm:right-4`} onPress={() => switchImage(1)}>
                  <IconChevronRight size={24} />
                </Button>
              </>
            )}
            {images[shownIndex] && <PreviewImage key={`${shownIndex}-${images[shownIndex]}`} src={images[shownIndex]} fitViewport={fitViewport} whiteBackground={whiteBackground} alt={`${label ?? flow.referenceImages} ${shownIndex + 1}`} />}
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
