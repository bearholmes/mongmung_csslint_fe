import { ref, computed } from 'vue';

/**
 * 구문 선택 기능을 제공하는 컴포저블
 * @returns {Object} 구문 선택 관련 상태 및 메소드
 */
export function useSyntaxSelector() {
  // 현재 선택된 구문
  const syntax = ref('css');
  
  // 선택 가능한 구문 옵션
  const syntaxOptions = [
    {
      label: 'CSS',
      value: 'css',
      type: 'css',
    },
    {
      label: 'HTML+CSS',
      value: 'html',
      type: 'html',
    }
  ];

  // 현재 선택된 구문의 label
  const selectedSyntaxLabel = computed(() => {
    const item = syntaxOptions.find((item) => item.value === syntax.value);
    return item ? item.label : '';
  });

  /**
   * 구문 타입 변경
   * @param {string} value 새 구문 값
   * @returns {string} 구문 타입
   */
  const changeSyntax = (value) => {
    syntax.value = value;
    const option = syntaxOptions.find(item => item.value === value);
    return option ? option.type : value;
  };

  return {
    syntax,
    syntaxOptions,
    selectedSyntaxLabel,
    changeSyntax
  };
}
