<template>
  <div class="wrap_cont" style="height: calc(100% - 111px)">
    <h1 class="title">404</h1>
    <p>왜 오류가 났을까요??</p>
    <p class="wrap_btn"><a href="/">Back</a></p>
  </div>
  <app-footer />
</template>
<script setup>
/**
 * NotFound 화면
 */
import AppFooter from '../components/AppFooter.vue';
</script>
<style scoped>
.wrap_cont {
  min-width: 1024px;
  max-width: 1024px;
  margin: 0 auto;
  padding: 30px;
}
.wrap_btn {
  margin-top: 30px;
}
</style>
