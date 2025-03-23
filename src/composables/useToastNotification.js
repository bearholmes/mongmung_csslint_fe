import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

/**
 * 토스트 알림 기능을 제공하는 컴포저블
 * @returns {Object} 토스트 관련 메소드
 */
export function useToastNotification() {
  const $toast = useToast();

  /**
   * 에러 메시지 표시
   * @param {string} message 에러 메시지
   * @param {Object} options 추가 옵션
   */
  const showError = (message, options = {}) => {
    $toast.error(message, {
      position: 'top',
      duration: 3000,
      ...options,
    });
  };

  /**
   * 성공 메시지 표시
   * @param {string} message 성공 메시지
   * @param {Object} options 추가 옵션
   */
  const showSuccess = (message, options = {}) => {
    $toast.success(message, {
      position: 'top',
      duration: 3000,
      ...options,
    });
  };

  /**
   * 정보 메시지 표시
   * @param {string} message 정보 메시지
   * @param {Object} options 추가 옵션
   */
  const showInfo = (message, options = {}) => {
    $toast.info(message, {
      position: 'top',
      duration: 3000,
      ...options,
    });
  };

  return {
    showError,
    showSuccess,
    showInfo,
  };
}
