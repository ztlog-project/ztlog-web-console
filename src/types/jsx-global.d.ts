import type { JSX as ReactJSX } from 'react';

/**
 * React 19의 @types/react는 전역 `JSX` 네임스페이스를 제거하고 `react` 모듈 안으로 옮겼다.
 * react-markdown(v8, @uiw/react-markdown-preview의 의존성)처럼 아직 이를 반영하지 않은
 * 라이브러리의 타입이 전역 `JSX.IntrinsicElements`를 참조해 깨지는 것을 막기 위한 브리지.
 */
declare global {
  namespace JSX {
    type IntrinsicElements = ReactJSX.IntrinsicElements;
  }
}

export {};
