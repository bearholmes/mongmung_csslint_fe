import { scroller } from 'vue-scrollto/src/scrollTo';

/**
 * 특정 위치로 스크롤 이동하는 유틸리티 함수
 * @param {string} target \#id 형태의 대상 요소 선택자
 * @returns {void}
 */
export function scrollToElement(target) {
  const scrollHelper = scroller();
  scrollHelper(target);
}
