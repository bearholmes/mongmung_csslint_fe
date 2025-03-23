import axios from 'axios';

/**
 * Lint 관련 API 요청을 처리하는 서비스
 */
export const lintService = {
  /**
   * 코드 린트 실행
   * @param {string} code 린트할 코드
   * @param {Object} config 린트 설정
   * @param {string} syntax 코드 문법 타입 (css, html 등)
   * @returns {Promise<Object>} 린트 결과
   */
  async lintCode(code, config, syntax) {
    const body = {
      code,
      config,
      syntax,
    };

    const response = await axios.post('/api/lint', body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data?.content || null;
  }
};
