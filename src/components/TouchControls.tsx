import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  onMoveStart: (side: 'left' | 'right', direction: 'up' | 'down') => void;
  onMoveEnd: (side: 'left' | 'right') => void;
  showLeft: boolean;
  showRight: boolean;
}

export const TouchControls: React.FC<Props> = ({
  onMoveStart,
  onMoveEnd,
  showLeft,
  showRight,
}) => {
  return (
    <div className="touch-controls-overlay">
      {showLeft && (
        <div className="touch-side touch-left">
          <button
            type="button"
            className="touch-btn"
            onPointerDown={() => onMoveStart('left', 'up')}
            onPointerUp={() => onMoveEnd('left')}
            onPointerCancel={() => onMoveEnd('left')}
          >
            <ArrowUp size={28} />
          </button>
          <button
            type="button"
            className="touch-btn"
            onPointerDown={() => onMoveStart('left', 'down')}
            onPointerUp={() => onMoveEnd('left')}
            onPointerCancel={() => onMoveEnd('left')}
          >
            <ArrowDown size={28} />
          </button>
        </div>
      )}

      {showRight && (
        <div className="touch-side touch-right">
          <button
            type="button"
            className="touch-btn"
            onPointerDown={() => onMoveStart('right', 'up')}
            onPointerUp={() => onMoveEnd('right')}
            onPointerCancel={() => onMoveEnd('right')}
          >
            <ArrowUp size={28} />
          </button>
          <button
            type="button"
            className="touch-btn"
            onPointerDown={() => onMoveStart('right', 'down')}
            onPointerUp={() => onMoveEnd('right')}
            onPointerCancel={() => onMoveEnd('right')}
          >
            <ArrowDown size={28} />
          </button>
        </div>
      )}
    </div>
  );
};
