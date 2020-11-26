<template functional lang="pug">
  li.item_result(:id="`${props.item.line}${props.item.column}${props.item.text}`" :class="props.item.severity")
    span.txt_location {{props.item.line}}:{{props.item.column}}
    span.emph_severity {{props.item.severity}}
    span.txt_message
      | {{props.item.text.replace(`(${props.item.rule})`, '')}}
      span.txt_rule (
        a.link_rule(:href="`//stylelint.io/user-guide/rules/${props.item.rule}/`" target="_blank") {{props.item.rule}}
        | )
</template>
<script>
/**
 * WarningList 행 컴포넌트 (functional)
 */
export default {
  name: 'WarningListItem'
};
</script>
<style lang="scss" scoped>
.item_result{align-items:baseline;display:flex}
.txt_location{min-width:60px;margin:0 8px 0 8px;font-size:12px;color:darkgray;flex:none}
.emph_severity{min-width:48px;margin:0 8px 0 0;padding:0 4px;border-radius:2px;font-size:10px;color:white;background-color:grey;flex:none;text-align:center}
.error .emph_severity{background-color:crimson}
.warning .emph_severity{background-color:gold}
.txt_message{margin:0;font-size:12px}
.txt_rule{color:darkgray}
.link_rule{
  color:darkgray;text-decoration:underline;
  &:hover{text-decoration:none}
}
</style>
