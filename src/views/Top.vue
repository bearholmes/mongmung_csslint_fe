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
            <div v-show="status.isLoading" class="ico_loader"></div>
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
                @click="lint()"
              >
                Lint
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="clear()"
              >
                Clear
              </button>
            </div>
            <div class="tf_custom">
              <!--              <textarea class="tf_textarea" v-model="inputCode"></textarea>-->
              <div id="inpTextarea" style="height: 100%"></div>
            </div>
            <div class="wrap_btn">
              <button
                :disabled="status.isLoading"
                class="btn_type1"
                type="button"
                @click="lint()"
              >
                Lint
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="clear()"
              >
                Clear
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="sample()"
              >
                Sample
              </button>
            </div>
            <div v-show="status.isLoaded" id="result" class="section_result">
              <h3 class="tit_paragraph">Result</h3>
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
                  style="height: 100%"
                ></div>
              </div>
            </div>

            <div v-show="status.isLoaded" class="nav_flow">
              <strong class="screen_out">퀵 메뉴</strong>
              <button
                class="btn_type2"
                type="button"
                @click="goto('#MongmungBody')"
              >
                TOP
              </button>
              <button class="btn_type2" type="button" @click="goto('#result')">
                Result
              </button>
              <button class="btn_type2" type="button" @click="goto('#diff')">
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
import recommendedConfig from 'stylelint-config-recommended';
import scssRecommendedConfig from 'stylelint-config-recommended-scss';
import standardConfig from 'stylelint-config-standard';
import WarningList from '../components/WarningList.vue';
import AppFooter from '../components/AppFooter.vue';
import AppHeader from '../components/AppHeader.vue';

import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';

loader.config({ monaco });

// loader.config({
//   paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' },
// });

const $toast = useToast();

const defaultConfig = {
  rules: Object.assign(recommendedConfig.rules, standardConfig.rules),
};
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
});

// 입력값
const inputCode = ref('');

const config = reactive({
  plugins: ['stylelint-order'],
  extends: [],
  rules: {
    'at-rule-name-case': 'lower',
    'at-rule-semicolon-newline-after': 'always',
    'block-closing-brace-newline-after': 'always',
    'block-no-empty': true,
    'block-opening-brace-space-after': 'never-single-line',
    'block-opening-brace-space-before': 'never-single-line',
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'color-named': 'never',
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'comment-whitespace-inside': 'always',
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-semicolon-space-after': 'never',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-trailing-semicolon': 'never',
    'declaration-colon-space-after': 'never',
    'declaration-colon-space-before': 'never',
    'declaration-no-important': true,
    'function-comma-space-after': 'never',
    'function-comma-space-before': 'never',
    'function-max-empty-lines': 0,
    'function-name-case': 'lower',
    'function-parentheses-space-inside': 'never',
    'function-url-quotes': 'never',
    // 'no-descending-specificity': [true, {ignore: ['selectors-within-list']}],
    'no-duplicate-selectors': [true, { disallowInList: false }],
    'no-eol-whitespace': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'property-case': 'lower',
    'property-no-unknown': true,
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-attribute-quotes': 'always',
    'selector-combinator-space-after': 'never',
    'selector-combinator-space-before': 'never',
    'selector-list-comma-space-after': 'never',
    'selector-list-comma-space-before': 'never',
    'selector-type-case': 'lower',
    'selector-pseudo-class-case': 'lower',
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'selector-pseudo-element-case': 'lower',
    'selector-pseudo-element-colon-notation': 'single',
    'selector-pseudo-element-no-unknown': true,
    'string-quotes': 'single',
    'unit-case': 'lower',
    'unit-no-unknown': true,
    'unit-whitelist': ['px', '%', 'dpi', 'dppx', 's', 'deg'],
    'value-keyword-case': 'lower',
    'value-list-comma-newline-after': 'never-multi-line',
    'value-list-comma-newline-before': 'never-multi-line',
    'value-list-comma-space-after': 'always',
    'value-list-comma-space-before': 'never',
    'value-list-max-empty-lines': 0,
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
  },
});
// api 응답 결과
const result = reactive({
  warnings: [],
  diff: '',
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

// diff 여부
const hasDiff = computed(() => {
  return JSON.stringify(result.diff) !== JSON.stringify(inputCode.value);
});

/**
 * 린트 실행 event
 * @public
 */
async function lint() {
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
    result.warnings = [];

    if (syntax.value === 'scss') {
      config.rules = Object.assign(
        defaultConfig.rules,
        scssRecommendedConfig.rules,
      );
    }
    const lintConfig = {
      code: inputCode.value,
      config: config || defaultConfig,
      syntax: syntax.value,
    };
    const response = await axios.post(`/api/lint`, lintConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    //     console.log(response, 'response');
    if (!response.data.lint) {
      status.isLoading = false;
      return;
    }
    // 응답값 치환
    const { warnings = [], diff = '', output = '' } = response.data.lint;
    result.warnings = Object.freeze(warnings);
    result.diff = Object.freeze(diff);
    status.isLoaded = true;

    // 기존 코드
    const beforeCode = Object.freeze(inputCode.value);
    // 변경된 코드
    const afterCode = Object.freeze(output);
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
        },
      );

      const originalModel = monacoInstance.editor.createModel(
        beforeCode,
        'html',
      );
      const modifiedModel = monacoInstance.editor.createModel(
        afterCode,
        'html',
      );

      window.diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel,
      });
    });

    await nextTick();
    goto('#result');
    status.isLoading = false;
  } catch (err) {
    status.isLoading = false;
    alert(err);
    console.log(err);
  }
}
/**
 * 초기화 event
 * @public
 */
async function clear() {
  inputCode.value = '';
  result.warnings = [];
  syntax.value = 'css';
  if (window.codeEditor) {
    window.codeEditor.setValue('');
    window.codeEditor.updateOptions({
      language: 'css',
    });
  }
  status.isLoaded = false;
  await nextTick();
  goto('#MongmungBody');
}
/**
 * 샘플 입력 event
 * @public
 */
function sample() {
  inputCode.value = sampleCode;
  syntax.value = 'html';
  if (window.codeEditor) {
    window.codeEditor.setValue(sampleCode);
    window.codeEditor.updateOptions({
      language: 'html',
    });
  }
}
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
    window.codeEditor.updateOptions({
      language: type,
    });
  }
  refSyntaxOpt.value.classList.remove('on');
}
/**
 * goto
 * @param {string} target \#id
 * @public
 */
function goto(target) {
  navScroller(target);
}

onMounted(() => {
  nextTick(() => {
    // 입력창 에디터 초기화
    loader.init().then((monacoInstance) => {
      window.codeEditor = monacoInstance.editor.create(
        document.getElementById('inpTextarea'),
        {
          value: '',
          language: 'css',
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
        },
      );
    });
  });
});
</script>
