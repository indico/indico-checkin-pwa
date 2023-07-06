import {useEffect, useState, useMemo} from 'react';
import {ReactFlipCardProps} from './CardFlipProps';

/**
 * CardFlip Component
 * Credits: https://github.com/AaronCCWong/react-card-flip/tree/master
 */
const CardFlip = (props: ReactFlipCardProps) => {
  const {
    cardStyles,
    cardZIndex,
    containerStyle,
    containerClassName,
    flipDirection,
    flipSpeedFrontToBack,
    flipSpeedBackToFront,
    infinite,
  } = props;
  const {back, front} = cardStyles || {};

  const [isFlipped, setFlipped] = useState(props.isFlipped); // isFlipped is the current state of the card. This is used to detect when to change the flip direction.
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (props.isFlipped !== isFlipped) {
      setFlipped(props.isFlipped);
      setRotation(c => c + 180);
    }
  }, [props.isFlipped, isFlipped]);

  const getContainerClassName = useMemo(() => {
    let className = 'card-flip';
    if (containerClassName) {
      className += ` ${containerClassName}`;
    }
    return className;
  }, [containerClassName]);

  const getComponent = (key: 0 | 1) => {
    if (props.children.length !== 2) {
      throw new Error('Component CardFlip requires 2 children to function');
    }
    return props.children[key];
  };

  const frontRotateY = `rotateY(${infinite ? rotation : isFlipped ? 180 : 0}deg)`;
  const backRotateY = `rotateY(${infinite ? rotation + 180 : isFlipped ? 0 : -180}deg)`;
  const frontRotateX = `rotateX(${infinite ? rotation : isFlipped ? 180 : 0}deg)`;
  const backRotateX = `rotateX(${infinite ? rotation + 180 : isFlipped ? 0 : -180}deg)`;

  const styles: any = {
    back: {
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      height: '100%',
      left: '0',
      position: isFlipped ? 'relative' : 'absolute',
      top: '0',
      transform: flipDirection === 'horizontal' ? backRotateY : backRotateX,
      transformStyle: 'preserve-3d',
      transition: `${flipSpeedFrontToBack}s`,
      width: '100%',
      ...back,
    },
    container: {
      perspective: '1000px',
      zIndex: `${cardZIndex}`,
    },
    flipper: {
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    front: {
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      height: '100%',
      left: '0',
      position: isFlipped ? 'absolute' : 'relative',
      top: '0',
      transform: flipDirection === 'horizontal' ? frontRotateY : frontRotateX,
      transformStyle: 'preserve-3d',
      transition: `${flipSpeedBackToFront}s`,
      width: '100%',
      zIndex: '2',
      ...front,
    },
  };

  return (
    <div className={getContainerClassName} style={{...styles.container, ...containerStyle}}>
      <div className="card-flipper" style={styles.flipper}>
        <div className="card-front" style={styles.front}>
          {getComponent(0)}
        </div>

        <div className="card-back" style={styles.back}>
          {getComponent(1)}
        </div>
      </div>
    </div>
  );
};

CardFlip.defaultProps = {
  cardStyles: {
    back: {},
    front: {},
  },
  cardZIndex: 'auto',
  containerStyle: {},
  flipDirection: 'horizontal',
  flipSpeedBackToFront: 0.6,
  flipSpeedFrontToBack: 0.6,
  infinite: false,
  isFlipped: false,
};

export default CardFlip;
