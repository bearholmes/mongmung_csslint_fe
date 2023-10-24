<template>
  <div>
    <div id="MongmungIndex"><a href="#MongmungBody">본문 바로가기</a></div>
    <div id="MongmungWrap" class="lint_type1">
      <app-header />
      <hr class="hide" />
      <div id="MongmungContent" class="k_main" role="main">
        <div id="cMain">
          <div id="mArticle" class="box_article">
            <h2 id="MongmungBody" class="screen_out">본문</h2>
            <h3 class="screen_out">입력</h3>
            <div class="wrap_menu">
              <div class="opt_custom" ref="refSyntaxOpt">
                <strong class="screen_out">언어 선택상자</strong>
                <em class="screen_out">선택내용</em>
                <a
                  class="link_selected"
                  href="javascript:;"
                  role="button"
                  @click="optToggle"
                >
                  {{ selectedSyntax }}
                </a>
                <div class="layer_opt">
                  <ul class="list_opt">
                    <li v-for="(item, idx) in options.syntax" :key="idx">
                      <a
                        class="link_opt"
                        href="javascript:;"
                        role="button"
                        @click="selectSyntaxOpt(item.value, item.type)"
                        >{{ item.label }}</a
                      >
                    </li>
                  </ul>
                </div>
              </div>
              <button
                :disabled="status.isLoading"
                class="btn_type1"
                type="button"
                @click="lintHandle"
              >
                Lint
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="clear"
              >
                Clear
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="sample"
              >
                Sample
              </button>
            </div>
            <div class="tf_custom">
              <div id="inpTextarea" style="height: 150px"></div>
            </div>
            <div v-show="status.isLoading" class="ico_loader"></div>
            <div v-show="status.isLoaded" id="result" class="section_result">
              <h3 class="tit_paragraph">Result</h3>
              <template v-if="!status.isCssSyntaxError">
                <h4 class="screen_out">문법 오류</h4>
                <warning-list
                  :list.sync="result.warnings"
                  :diff="hasDiff"
                ></warning-list>
                <h4 class="screen_out">위치</h4>
                <div id="diff" class="box_diff">
                  <div
                    id="editor"
                    v-show="!!inputCode"
                    style="height: 400px"
                  ></div>
                </div>
              </template>
              <div class="box_error" v-else>
                <strong class="emph_color">CSS Syntax Error 😢</strong>
                <span class="txt_message">
                  입력 값을 확인 후, 다시 시도해주세요.
                </span>
              </div>
              <div class="wrap_btn">
                <button
                  type="button"
                  class="btn_type2"
                  @click="status.isShowRules = !status.isShowRules"
                >
                  Rules
                  <span class="screen_out">
                    {{ status.isShowRules ? '접기' : '펼치기' }}
                  </span>
                </button>
              </div>
              <h4 class="screen_out">규칙</h4>
              <div v-show="status.isShowRules" class="box_rules">
                <pre>{{
                  {
                    version: result.version,
                    ...result.config,
                    rules: config.rules,
                  }
                }}</pre>
              </div>
            </div>

            <div v-show="status.isLoaded" class="nav_flow">
              <strong class="screen_out">퀵 메뉴</strong>
              <button
                class="btn_type2"
                type="button"
                @click="gotoScroll('#MongmungBody')"
              >
                TOP
              </button>
              <button
                class="btn_type2"
                type="button"
                @click="gotoScroll('#result')"
              >
                Result
              </button>
              <button
                v-show="!status.isCssSyntaxError"
                class="btn_type2"
                type="button"
                @click="gotoScroll('#diff')"
              >
                Diff
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr class="hide" />
      <app-footer />
    </div>
  </div>
</template>
<script setup>
/**
 * 메인 화면
 */
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { scroller } from 'vue-scrollto/src/scrollTo';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import WarningList from '../components/WarningList.vue';
import AppFooter from '../components/AppFooter.vue';
import AppHeader from '../components/AppHeader.vue';

import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

const $toast = useToast();

const navScroller = scroller();
const sampleCode = `<style>
#testColl .tbl_weather .ico_yesterday .bar {color:#e0e0e0 !important;margin:0 1px}
#testColl .tbl_weather .ico_yesterday .max {font:11PX "돋움", dotum;color:#f73a40}
#testColl .tbl_weather .ico_temp {display:block;position:absolute;left:0;overflow:hidden;width:35px;color:#444}
#testColl .wrap_whole .wrap_selectday {width:402px;height:38px;background:#F8F8F8;border-bottom:1px solid #adb1bb}
#testColl .list_daily .ico_arrow {display:none;position:absolute;bottom:-7px;left:45%;width:11px;height:7px;background-position:0 -250px;line-height:0;font-size:0}
#testColl .list_daily .day2 .ico_arrow, .list_daily .day2 .ico_arrow {background-position:0 -275px}
#testColl .list_daily .day4 .ico_arrow {background-position:0 -300px}
#testColl .wrap_overlap .list_overlap {width:90%;float:left}
</style>
<div id="weatherCollFavor" class="wrap_favor" style="display:none;">
    <strong class="tit_favor">관심지역</strong>
    <div class="select_box">
        <a id="weatherCollFavSel" href="javascript:;" class="selector">관심지역 보기</a>
        <div id="weatherCollAttantionArea" class="layer_dropdown" style="display:None">
            <ul id="weatherCollFavArea" class="list_favor">
                <li>
                    <a target="_blank" href="javascript:;">로그인이 필요합니다.</a>
                </li>
            </ul>
            <a href="javascript:;" class="favor_edit" target="_blank">관심지역 수정하기</a>
            <img alt="설명" src="#">
        </div>
    </div>
    <span title="흐림" class="ico_w20 ico_w4">흐림</span> 13 <span class="screen_out">℃</span>
    <span id="weatherCollFavTxt" class="fL">의 날씨정보를 볼 수 있습니다.</span>
</div>`;

// 상태
const status = reactive({
  isLoaded: false,
  isLoading: false,
  isShowRules: false,
  isCssSyntaxError: false,
});

// 입력값
const inputCode = ref('');

// 설정
//https://www.npmjs.com/package/stylelint-stylistic
const config = reactive({
  rules: {
    'color-named': 'never',
    'declaration-block-single-line-max-declarations': 99,
    'declaration-no-important': true,
    'declaration-property-value-no-unknown': true,
    'no-descending-specificity': false,
    'order/properties-order': [
      'display',
      'overflow',
      'overflow-wrap',
      'overflow-x',
      'overflow-y',
      'float',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'width',
      'max-width',
      'min-width',
      'height',
      'max-height',
      'min-height',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'border',
      'border-top',
      'border-right',
      'border-bottom',
      'border-left',
      'border-width',
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width',
      'border-style',
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-radius',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
      'box-shadow',
      'border-spacing',
      'font',
      'font-style',
      'font-variant',
      'font-weight',
      'font-stretch',
      'font-size',
      'line-height',
      'font-family',
      'color',
      'background',
      'background-attachment',
      'background-blend-mode',
      'background-clip',
      'background-color',
      'background-image',
      'background-origin',
      'background-position',
      'background-repeat',
      'background-size',
    ],
    'selector-class-pattern': false,
    'selector-id-pattern': false,
    'stylistic/at-rule-name-case': 'lower',
    'stylistic/at-rule-semicolon-newline-after': 'always',
    'stylistic/block-closing-brace-newline-after': 'always',
    'stylistic/block-opening-brace-space-after': 'never-single-line',
    'stylistic/block-opening-brace-space-before': 'never-single-line',
    'stylistic/color-hex-case': 'lower',
    'stylistic/declaration-block-semicolon-space-after': 'never',
    'stylistic/declaration-block-semicolon-space-before': 'never',
    'stylistic/declaration-block-trailing-semicolon': 'never',
    'stylistic/declaration-colon-space-after': 'never',
    'stylistic/declaration-colon-space-before': 'never',
    'stylistic/function-comma-space-after': 'never',
    'stylistic/function-comma-space-before': 'never',
    'stylistic/function-parentheses-space-inside': 'never',
    'stylistic/no-extra-semicolons': true,
    'stylistic/property-case': 'lower',
    'stylistic/selector-attribute-brackets-space-inside': 'never',
    'stylistic/selector-attribute-operator-space-after': 'never',
    'stylistic/selector-attribute-operator-space-before': 'never',
    'stylistic/selector-combinator-space-after': 'never',
    'stylistic/selector-combinator-space-before': 'never',
    'stylistic/selector-list-comma-space-after': 'never',
    'stylistic/selector-list-comma-space-before': 'never',
    'stylistic/selector-pseudo-class-case': 'lower',
    'stylistic/selector-pseudo-class-parentheses-space-inside': 'never',
    'stylistic/selector-pseudo-element-case': 'lower',
    'stylistic/string-quotes': 'single',
    'stylistic/unit-case': 'lower',
    'stylistic/value-list-comma-space-after': 'always',
    'stylistic/value-list-comma-space-before': 'never',
  },
});

// api 응답 결과
const result = reactive({
  warnings: [],
  version: '',
  config: {},
});

// syntax 선택
const syntax = ref('css');
// syntax 선택상자 ref
const refSyntaxOpt = ref(null);
// 선택상자 options
const options = reactive({
  syntax: [
    {
      label: 'CSS',
      value: 'css',
      type: 'css',
    },
    {
      label: 'HTML+CSS',
      value: 'html',
      type: 'html',
    },
  ],
});

// 선택된 syntax label
const selectedSyntax = computed(() => {
  const item = options.syntax.find((item) => item.value === syntax.value);
  return item ? item.label : '';
});

/**
 * 디자인선택상자 토글 event
 * @public
 */
function optToggle() {
  refSyntaxOpt.value.classList.toggle('on');
}
/**
 * 디자인선택상자 값 선택 event
 * @param {string} value
 * @param type
 * @public
 */
function selectSyntaxOpt(value, type) {
  syntax.value = value;
  if (window.codeEditor) {
    inputCode.value = window.codeEditor.getValue();
  }
  initEditor(type, inputCode.value);
  refSyntaxOpt.value.classList.remove('on');
}

// diff 여부
const hasDiff = computed(() => {
  return JSON.stringify(result.diff) !== JSON.stringify(inputCode.value);
});

/**
 * 린트 실행 event
 * @public
 */
async function lintHandle() {
  try {
    if (window.codeEditor) {
      inputCode.value = window.codeEditor.getValue();
    }
    if (inputCode.value === '') {
      $toast.error('코드를 입력해주세요.', {
        position: 'top',
        duration: 3000,
      });
      return;
    }
    status.isLoading = true;
    status.isCssSyntaxError = false;
    result.warnings = [];

    const body = {
      code: inputCode.value,
      config: config,
      syntax: syntax.value,
    };
    const response = await axios.post(`/api/lint`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // console.log(response, 'response');
    if (!response.data.content) {
      status.isLoading = false;
      return;
    }
    // 응답값 치환
    const { warnings = [], info = {}, output = '' } = response.data?.content;
    result.warnings = Object.freeze(warnings);
    result.version = info?.version;
    result.config = info?.config;
    status.isLoaded = true;

    if (output.includes('SyntaxError')) {
      status.isCssSyntaxError = true;
    } else {
      // 기존 코드
      const beforeCode = Object.freeze(inputCode.value);
      // 변경된 코드
      const afterCode = Object.freeze(output);
      // diff 에디터 초기화
      initDiffEditor(syntax.value, beforeCode, afterCode);
    }

    await nextTick();
    gotoScroll('#result');
    status.isLoading = false;
  } catch (err) {
    status.isLoading = false;
    $toast.error(
      err?.response?.data?.message || err?.message || '네트워크 오류',
      {
        position: 'top',
        duration: 3000,
      },
    );
    console.error(err);
  }
}
/**
 * 초기화 event
 * @public
 */
async function clear() {
  status.isCssSyntaxError = false;
  inputCode.value = '';
  result.warnings = [];
  syntax.value = 'css';
  initEditor('css', inputCode.value);
  status.isLoaded = false;
  await nextTick();
  gotoScroll('#MongmungBody');
}
/**
 * 샘플 입력 event
 * @public
 */
function sample() {
  status.isCssSyntaxError = false;
  inputCode.value = sampleCode;
  result.warnings = [];
  syntax.value = 'html';
  initEditor('html', inputCode.value);
  status.isLoaded = false;
}

/**
 * 특정 위치로 스크롤 이동
 * @param {string} target \#id
 * @public
 */
function gotoScroll(target) {
  navScroller(target);
}

/**
 * 에디터 초기화
 * @public
 * @param syntax
 * @param code
 */
function initEditor(syntax, code) {
  if (window.codeEditor) {
    window.codeEditor.dispose();
    document.getElementById('inpTextarea').innerHTML = '';
  }
  // 입력창 에디터 초기화
  loader.init().then((monacoInstance) => {
    window.codeEditor = monacoInstance.editor.create(
      document.getElementById('inpTextarea'),
      {
        value: code || '',
        language: syntax,
        // noSemanticValidation: false,
        // noSyntaxValidation: false,
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
      },
    );
  });
}

/**
 * diff 에디터 초기화
 * @public
 * @param syntax
 * @param beforeCode
 * @param afterCode
 */
function initDiffEditor(syntax, beforeCode, afterCode) {
  if (window.diffEditor) window.diffEditor.dispose();
  document.getElementById('editor').innerHTML = '';

  // 에디터 초기화
  loader.init().then((monacoInstance) => {
    window.diffEditor = monacoInstance.editor.createDiffEditor(
      document.getElementById('editor'),
      {
        // You can optionally disable the resizing
        enableSplitViewResizing: true,
        originalEditable: false,
        automaticLayout: true,
        renderSideBySide: true,
        theme: 'vs-light',
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,
      },
    );

    const originalModel = monacoInstance.editor.createModel(beforeCode, syntax);
    const modifiedModel = monacoInstance.editor.createModel(afterCode, syntax);

    window.diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  });
}

onMounted(() => {
  nextTick(() => {
    initEditor('css', '');
  });
});
</script>
