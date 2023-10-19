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
            <div class="tf_custom">
              <div id="inpTextarea" style="height: 100%"></div>
            </div>
            <div v-show="status.isLoading" class="ico_loader"></div>
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
              <div
                v-show="status.isShowRules"
                style="
                  margin-top: 10px;
                  height: 300px;
                  overflow-y: auto;
                  border: 1px solid #e7e7e7;
                  font-size: 11px;
                "
              >
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
});

// 입력값
const inputCode = ref('');

const config = reactive({
  rules: {
    'color-named': 'never',
    'declaration-block-single-line-max-declarations': 99,
    'declaration-no-important': true,
    'declaration-property-value-no-unknown': true,
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
  },
});
// api 응답 결과
const result = reactive({
  warnings: [],
  version: '',
  config: {},
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

    const body = {
      code: inputCode.value,
      config: config,
    };
    const response = await axios.post(`/api/lint`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    //     console.log(response, 'response');
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
  if (window.codeEditor) {
    window.codeEditor.setValue('');
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
  result.warnings = [];
  if (window.codeEditor) {
    window.codeEditor.setValue(sampleCode);
  }
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
          language: 'html',
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
