import React from 'react';
import styled from '@emotion/styled';

interface Props {
  text?: string;
  as?: React.ElementType;
  children: React.ReactNode | React.ComponentType;
}

const Tooltip: React.FC<Props> = ({text, as, children}) => {
  return (
    <TooltipWrapper as={as}>
      {children}
      {text && (
        <TooltipBox>{text}</TooltipBox>
      )}
    </TooltipWrapper>
  )  
};

Tooltip.displayName = 'Tooltip';
export default React.memo(Tooltip);

const TooltipBox = styled.span`
  position: absolute;
  left: 50%;
  top: 0;
  
  padding: 8px 10px;
  transform: translate(-50%, -110%);
  background-color: #fff;
  border: 1px solid #333;
  color: #333;
  font-size: 12px;
  line-height: 1.5;
  white-space:nowrap;
  display: none;
`;

const TooltipWrapper = styled.div`
  position: relative;

  &:hover {
    ${TooltipBox} {
      display: block;
    }
  }
`;
