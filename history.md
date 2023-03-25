top:

```
<select v-model="syntax">
    <option value="css">CSS</option>
    <option value="scss">SCSS</option>
    <option value="sass">Sass</option>
    <option value="less">Less</option>
    <option value="html">HTML+CSS</option>
    <option value="markdown">Markdown</option>
</select>
```

```
//-- | option 위치 //
            //-- <vue-prism-editor
              :code="code"
              :language="editLang"
              v-model="code"
              :lineNumbers="true"
              :readonly="isLoading"
              ></vue-prism-editor> //
```

```
 //-- <vue-prism-editor :code="afterCode" :language="editLang" :lineNumbers="true" :readonly="false"></vue-prism-editor> //
```

```
<script>

// 11/1 prismjs 코드하이라이트 기능 제거
// import 'prismjs';
// import vuePrismEditor from 'vue-prism-editor';
// 10/30 diff 코드하이라이트 기능 제거
// import hljs from 'highlight.js'
```

```
<style>
/* 11/1 prismjs 코드하이라이트 기능 제거 */
/* @import url('~vue-prism-editor/dist/VuePrismEditor.css');
@import url('~prismjs/themes/prism.css'); */
/* 10/30 diff 코드하이라이트 기능 제거 */
/* @import url('~highlight.js/styles/github.css'); */
/* 11/1 prismjs 코드하이라이트 기능 제거 */
/* .prism-editor-wrapper{font-size:12px}
.prism-editor__line-number{font-size:12px} */

```
