<template>
  <div class="opt_custom" ref="selectorRef" :class="{ on: isOpen }">
    <strong class="screen_out">언어 선택상자</strong>
    <em class="screen_out">선택내용</em>
    <a class="link_selected" href="javascript:;" role="button" @click="toggleDropdown">
      {{ label }}
    </a>
    <div class="layer_opt">
      <ul class="list_opt">
        <li v-for="(option, idx) in options" :key="idx">
          <a
            class="link_opt"
            href="javascript:;"
            role="button"
            @click="selectOption(option.value, option.type)"
          >
            {{ option.label }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * 구문 선택 컴포넌트
 */
const props = defineProps({
  /**
   * 선택된 값
   */
  modelValue: {
    type: String,
    required: true
  },
  /**
   * 선택지 목록
   */
  options: {
    type: Array,
    required: true
  },
  /**
   * 표시될 라벨
   */
  label: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'selectOption']);

// 드롭다운 상태
const isOpen = ref(false);
// 컴포넌트 참조
const selectorRef = ref(null);

/**
 * 드롭다운 토글
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

/**
 * 옵션 선택 처리
 * @param {string} value 선택된 값
 * @param {string} type 선택된 타입
 */
const selectOption = (value, type) => {
  emit('update:modelValue', value);
  emit('selectOption', { value, type });
  isOpen.value = false;
};
</script>
