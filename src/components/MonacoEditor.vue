<template>
  <div :id="editorId" :style="{ height: height }"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useMonacoEditor } from '../composables/useMonacoEditor';

/**
 * Monaco 코드 에디터 컴포넌트
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
   * 초기 코드 내용
   */
  modelValue: {
    type: String,
    default: ''
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
    default: '150px'
  }
});

const emit = defineEmits(['update:modelValue']);

const { code, initEditor, getEditorValue, setEditorValue, disposeEditors } = useMonacoEditor();

// 코드가 변경될 때 이벤트 발생
watch(code, (newVal) => {
  emit('update:modelValue', newVal);
});

// props의 modelValue가 변경될 때 에디터 값도 변경
watch(() => props.modelValue, (newVal) => {
  if (newVal !== code.value) {
    setEditorValue(newVal);
  }
});

// props의 language가 변경될 때 에디터 재초기화
watch(() => props.language, async () => {
  await initEditor(props.language, props.modelValue, props.editorId);
});

onMounted(async () => {
  await initEditor(props.language, props.modelValue, props.editorId);
});

onBeforeUnmount(() => {
  disposeEditors();
});

// 외부에 노출할 메소드 정의
defineExpose({
  getValue: getEditorValue,
  setValue: setEditorValue
});
</script>
