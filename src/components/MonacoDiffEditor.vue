<template>
  <div :id="editorId" :style="{ height: height }"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useMonacoEditor } from '../composables/useMonacoEditor';

/**
 * Monaco Diff 에디터 컴포넌트
 */
const props = defineProps({
  /**
   * 에디터 ID
   */
  editorId: {
    type: String,
    required: true
  },
  /**
   * 원본 코드
   */
  originalCode: {
    type: String,
    required: true
  },
  /**
   * 수정된 코드
   */
  modifiedCode: {
    type: String,
    required: true
  },
  /**
   * 언어 타입
   */
  language: {
    type: String,
    default: 'css'
  },
  /**
   * 에디터 높이
   */
  height: {
    type: String,
    default: '400px'
  }
});

const { initDiffEditor, disposeEditors } = useMonacoEditor();

// originalCode 또는 modifiedCode가 변경될 때 에디터 업데이트
watch([() => props.originalCode, () => props.modifiedCode], async () => {
  await initDiffEditor(props.language, props.originalCode, props.modifiedCode, props.editorId);
});

// language가 변경될 때 에디터 업데이트
watch(() => props.language, async () => {
  await initDiffEditor(props.language, props.originalCode, props.modifiedCode, props.editorId);
});

onMounted(async () => {
  await initDiffEditor(props.language, props.originalCode, props.modifiedCode, props.editorId);
});

onBeforeUnmount(() => {
  disposeEditors();
});
</script>
