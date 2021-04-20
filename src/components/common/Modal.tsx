import React from 'react';
import styled from '@emotion/styled';
import {keyframes, css, SerializedStyles} from '@emotion/react';
 
type VerticalAlign = 'top' | 'center' | 'bottom';

export interface ModalProps {
  closeCallback: () => void;
  onClose?: () => void;
  open?: boolean;
  verticalAlign?: VerticalAlign;
  animationDuration?: number;
  children: React.ReactNode | React.ComponentType;
}

const ANIMATION_DURATION = 500;

const Modal: React.FC<ModalProps> = ({
  closeCallback,
  onClose,
  open: _open = true,
  verticalAlign = 'center',
  animationDuration = ANIMATION_DURATION,
  children
}) => {
  const [isActive, setIsActive] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(_open);

  const closeClickHandler = React.useCallback(() => {
    closeCallback();
  }, [closeCallback]);
  
  React.useEffect(() => {
    if(isOpen) {
      setTimeout(() => {
        setIsActive(true);
      });
    }
  }, [isOpen, setIsActive]);
  
  React.useEffect(() => {
    if(_open) {
      setIsOpen(_open)
    } else {
      setIsActive(false);
      setTimeout(() => {
        setIsOpen(false);
        onClose && onClose();
      }, animationDuration);
    }
  }, [_open, setIsOpen, setIsActive, onClose]);
  
  return (
    isOpen ? (
      <ModalWrapper active={isActive} align={verticalAlign}>
        {isActive && (
          <CloseButton onClick={closeClickHandler}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJDdZshAt7YOtpxOZ0FbQ6xUB8BxZ2HcNyx3dQ2Y_4MFUfiuh0DYtY5WlOp5xRmnXs9lA&usqp=CAU" title="close" />
          </CloseButton>
        )}
        <ModalBg duration={animationDuration} onClick={closeClickHandler} />
        <ModalWindow css={isActive 
          ? css`
            animation-name: ${openKeyFrame};
            animation-duration: ${animationDuration}ms;
            animation-fill-mode: forwards;
          ` 
          : null}>
          {children}
        </ModalWindow>
      </ModalWrapper>
    ) : null
  )
};

Modal.displayName = 'Modal';
export default React.memo(Modal);

const CloseButton = styled.button`
  position: absolute;
  right: 50px;
  top: 50px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background-color: #fff;
  border-radius: 50%;
  font-size: 0;
  z-index: 20;

  img {
    max-width: 100%;
  }
`;

const ModalBg = styled.div<{duration: number}>`
  position: fixed;
  left: 0; 
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: all ${({duration}) => `${duration}ms`};
`;

const openKeyFrame = keyframes`
  0 {
    transform: scale(0);
  }
  80% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;


const ModalWindow = styled.div<{css?: SerializedStyles | null}>`
  position: relative;
  display: inline-block;
  width: auto;
  max-width: 80%;
  margin: 50px 0;
  z-index: 1;
  transform: scale(0);
  text-align: left;
  ${({css}) => css && css};
`;

const ModalWrapper = styled.div<{active: boolean, align: VerticalAlign}>`
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 1000;
  text-align: center;
  overflow-y: auto;
  justify-content: center;
  
  ${({active, align}) => active && `
    ${ModalBg} {
      opacity: 1;
    }
    align-items: ${align === 'top' 
      ? 'flex-start' 
      : align === 'bottom' 
        ? 'flex-end'
        : 'center'
    }
  `}
`;



