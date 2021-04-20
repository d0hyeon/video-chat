import styled from '@emotion/styled';
import { SerializedStyles } from '@emotion/utils';
import { ThemeColor } from '@src/constant/theme';

export const Layout = styled.div`
  width: 1100px;
  margin: 30px auto;
`;

export const Header = styled.header`
  margin-bottom: 40px;
  h1, h2 {
    margin-bottom: 10px;
  }
`;


export const Section = styled.section<{css?: SerializedStyles}>`
  & ~ & {
    margin-top: 15px;
  }

  h2 {
    margin-bottom: 10px;
  }
  ${({css}) => css && css}
`;

export const Article = styled.article`
  position: relative;
  & ~ & {
    margin-top: 10px;
  }

  h3 {
    margin-bottom: 5px;
  }
`

export const Button = styled.button<{disabled?: boolean, width?: number, height?: number}>`
  height: 30px;
  padding: 0 10px;
  border: 1px solid #666;
  color: #333 ;
  line-height: 28px;
  font-size: 14px;
  ${({disabled, width, height}) => `
    width: ${width ?? 100}px;
    height: ${height ?? 30}px;
    ${disabled && `
      opacity: 0.6;
    `}
  `}
`;

export const RadiusButton = styled.button<{color?: ThemeColor, width?: number; height?: number, disabled?: boolean}>`
  margin: 0 10px;
  border: 1px solid #333;
  background-color: #fff;
  font-size: 14px;
  color: #333;

  ${({color, width, height, disabled}) => `
    width: ${width ?? 150}px;
    height: ${height ?? 40}px;
    border-radius: ${(height ?? 40)/2}px;
    ${!!color && `
      background-color: ${color};
      border-color: ${color};
      color: #fff;
    `}
    ${disabled && `
      opacity: 0.5;
    `}
  `}
`;

export const Ul = styled.ul`
  padding-left: 10px;

  > li {
    position: relative;
    padding-left: 10px;
    font-size: 17px;
    line-height: 1.3;
    & ~ li {
      margin-top: 8px;
    }
    &::before {
      position: absolute;
      left: 0;
      top: 0;
      content: '-';
    }

    > ul {
      position: relative;
      padding: 0;
      margin-left: -4px;
      overflow: hidden;
      &::before {
        position: absolute;
        left: 0;
        top: 0;
        width: 1px;
        height: 1000px;
        background-color: #333;
        content: '';
      }
      li {
        font-size: 16px;
      }
    }
  }
`;

export const CodeBlock = styled.pre`
  display: block;
  background-color: rgba(135,131,120,0.15);
  line-height: 1.5;
  color: #333;
  padding: 10px;
  font-size: 16px;
  font-family: 'Do Hyeon', sans-serif;
`;

export const PopupBody = styled.div<{width?: number}>`
  width: ${({width}) => width ? `${width}px` : '500px'};
  padding: 20px;
  background-color: #fff;
`;

export const PopupHeader = styled.header`
  margin-bottom: 30px;
  color: #333;
`

export const PopupTitle = styled.h1`
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: bold;
  
`;

export const PopupDescription = styled.p`
  font-size: 18px;
`;
