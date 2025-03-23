<template>
  <ul class="lst_result">
    <li class="success" v-if="list.length === 0 && diff">
      &#9728; ALL PASS :)
    </li>
    <li class="caution" v-if="list.length === 0 && !diff">&#9729; Caution</li>
    <li class="warning" v-if="list.length > 0 && !diff">
      &#9730; Warning ({{ list.length }})
    </li>
    <warning-list-item v-for="(items, idx) in list" :key="idx" :item="items" />
  </ul>
</template>
<script setup>
import WarningListItem from './WarningListItem.vue';
/**
 * WarningList 테이블 컴포넌트
 */
defineProps({
  /**
   * 경고 목록
   */
  list: {
    type: Array,
    default: () => [],
  },
  /**
   * diff 포함 여부
   */
  diff: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss" scoped>
.success {
  margin: 10px 8px;
  font-family: initial;
  font-size: 18px;
  color: #008000;
}
.caution {
  margin: 10px 8px;
  font-family: initial;
  font-size: 18px;
  color: #ff8a65;
}
.warning {
  margin: 10px 8px;
  font-family: initial;
  font-size: 14px;
  color: #e74c3c;
}
.lst_result {
  margin-top: 2px;
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro,
    monospace;
}
</style>
