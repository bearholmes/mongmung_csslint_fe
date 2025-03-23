import { ref, shallowRef } from 'vue';
import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

/**
 * Monaco 에디터 관련 기능을 제공하는 컴포저블
 * @returns {Object} Monaco 에디터 관련 상태 및 메소드
 */
export function useMonacoEditor() {
  // 에디터 인스턴스 참조
  const codeEditor = shallowRef(null);
  const diffEditor = shallowRef(null);
  
  // 코드 내용
  const code = ref('');

  /**
   * 에디터 초기화
   * @param {string} syntax 언어 타입 (css, html 등)
   * @param {string} initialCode 초기 코드
   * @param {string} elementId 에디터가 마운트될 요소 ID
   * @returns {Promise<void>}
   */
  const initEditor = async (syntax, initialCode, elementId) => {
    // 기존 에디터가 있으면 제거
    if (codeEditor.value) {
      codeEditor.value.dispose();
      document.getElementById(elementId).innerHTML = '';
    }
    
    // 새 에디터 생성
    const monacoInstance = await loader.init();
    codeEditor.value = monacoInstance.editor.create(
      document.getElementById(elementId),
      {
        value: initialCode || '',
        language: syntax,
        minimap: {
          enabled: false,
        },
        suggest: {
          showFields: false,
          showFunctions: false,
        },
        formatOnPaste: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,
      }
    );
    
    // 코드 내용 설정
    code.value = initialCode || '';
  };

  /**
   * 에디터 값 가져오기
   * @returns {string} 현재 에디터 코드
   */
  const getEditorValue = () => {
    if (codeEditor.value) {
      code.value = codeEditor.value.getValue();
    }
    return code.value;
  };

  /**
   * Diff 에디터 초기화
   * @param {string} syntax 언어 타입 (css, html 등)
   * @param {string} beforeCode 원본 코드
   * @param {string} afterCode 변경된 코드
   * @param {string} elementId diff 에디터가 마운트될 요소 ID
   * @returns {Promise<void>}
   */
  const initDiffEditor = async (syntax, beforeCode, afterCode, elementId) => {
    // 기존 diff 에디터가 있으면 제거
    if (diffEditor.value) {
      diffEditor.value.dispose();
    }
    document.getElementById(elementId).innerHTML = '';

    // 새 diff 에디터 생성
    const monacoInstance = await loader.init();
    diffEditor.value = monacoInstance.editor.createDiffEditor(
      document.getElementById(elementId),
      {
        enableSplitViewResizing: true,
        originalEditable: false,
        automaticLayout: true,
        renderSideBySide: true,
        theme: 'vs-light',
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,
      }
    );

    const originalModel = monacoInstance.editor.createModel(beforeCode, syntax);
    const modifiedModel = monacoInstance.editor.createModel(afterCode, syntax);

    diffEditor.value.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  };

  /**
   * 에디터 값 설정하기
   * @param {string} newCode 새 코드 값
   */
  const setEditorValue = (newCode) => {
    if (codeEditor.value) {
      codeEditor.value.setValue(newCode);
      code.value = newCode;
    }
  };

  /**
   * 에디터 정리 (dispose)
   */
  const disposeEditors = () => {
    if (codeEditor.value) {
      codeEditor.value.dispose();
      codeEditor.value = null;
    }
    
    if (diffEditor.value) {
      diffEditor.value.dispose();
      diffEditor.value = null;
    }
  };

  return {
    code,
    initEditor,
    initDiffEditor,
    getEditorValue,
    setEditorValue,
    disposeEditors
  };
}
