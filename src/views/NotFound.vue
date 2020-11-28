<template lang="pug">
  div.wrap_cont
    h1.title 404
    p 왜 오류가 났을까요??
    p.wrap_btn
      a(href="/") Back
</template>
<script>
/**
 * NotFound 화면
 */
export default {
  name: 'NotFound'
};
</script>
<style scoped>
.wrap_cont{min-width:1024px;max-width:1024px;margin:0 auto;padding:30px}
.wrap_btn{margin-top:30px}
</style>
