import { ref, reactive, computed } from 'vue';
import { lintService } from '../services/lintService';
import { useToastNotification } from './useToastNotification';
import { DEFAULT_LINT_RULES } from '../config/constants';

/**
 * 린트 관련 상태 및 기능을 제공하는 컴포저블
 * @returns {Object} 린트 관련 상태 및 메소드
 */
export function useLint() {
  const { showError } = useToastNotification();

  // 상태
  const status = reactive({
    isLoaded: false,
    isLoading: false,
    isShowRules: false,
    isCssSyntaxError: false,
  });

  // 결과
  const result = reactive({
    warnings: [],
    version: '',
    config: {},
    diff: '',
  });

  // 설정
  const config = reactive({
    outputStyle: '', // compact, nested
    rules: { ...DEFAULT_LINT_RULES },
  });

  /**
   * 린트 실행
   * @param {string} code 린트할 코드
   * @param {string} syntax 코드 문법 타입 (css, html 등)
   * @returns {Promise<Object>} 린트 결과
   */
  const runLint = async (code, syntax) => {
    if (!code) {
      showError('코드를 입력해주세요.');
      return null;
    }

    try {
      status.isLoading = true;
      status.isCssSyntaxError = false;
      result.warnings = [];

      const lintResult = await lintService.lintCode(code, config, syntax);

      if (!lintResult) {
        status.isLoading = false;
        return null;
      }

      // 응답값 처리
      const { warnings = [], info = {}, output = '' } = lintResult;
      result.warnings = Object.freeze(warnings);
      result.version = info?.version;
      result.config = info?.config;
      result.diff = output;
      status.isLoaded = true;

      if (output.includes('SyntaxError')) {
        status.isCssSyntaxError = true;
      }

      status.isLoading = false;
      return lintResult;

    } catch (err) {
      status.isLoading = false;
      showError(err?.response?.data?.message || err?.message || '네트워크 오류');
      console.error(err);
      return null;
    }
  };

  /**
   * 린트 결과 초기화
   */
  const resetLint = () => {
    status.isCssSyntaxError = false;
    result.warnings = [];
    result.diff = '';
    result.version = '';
    result.config = {};
    status.isLoaded = false;
  };

  /**
   * 규칙 표시 토글
   */
  const toggleRules = () => {
    status.isShowRules = !status.isShowRules;
  };

  /**
   * diff 여부 확인
   */
  const hasDiff = computed(() => {
    return result.diff && result.diff !== '';
  });

  return {
    status,
    result,
    config,
    hasDiff,
    runLint,
    resetLint,
    toggleRules
  };
}
