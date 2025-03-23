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
              <!-- 언어 선택 -->
              <syntax-selector
                v-model="syntax"
                :options="syntaxOptions"
                :label="selectedSyntaxLabel"
                @select-option="handleSyntaxSelect"
              />

              <!-- 액션 버튼 -->
              <button
                :disabled="status.isLoading"
                class="btn_type1"
                type="button"
                @click="handleLint"
              >
                Lint
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="handleClear"
              >
                Clear
              </button>
              <button
                :disabled="status.isLoading"
                class="btn_type2"
                type="button"
                @click="handleSample"
              >
                Sample
              </button>

              <!-- CSS 출력 스타일 선택 -->
              <div v-if="syntax === 'css'" style="margin: 9px 0 0 7px">
                <span style="margin-right: 14px"
                  >Output Style
                  <span
                    style="color: #999; vertical-align: super; font-size: 10px"
                    >beta</span
                  ></span
                >
                <label>
                  <input
                    type="radio"
                    v-model="config.outputStyle"
                    :disabled="status.isLoading"
                    value="nested"
                  />
                  <span class="custom-radio"></span>
                  nested
                </label>

                <label>
                  <input
                    type="radio"
                    v-model="config.outputStyle"
                    :disabled="status.isLoading"
                    value="compact"
                  />
                  <span class="custom-radio"></span>
                  compact
                </label>
                <label>
                  <input
                    type="radio"
                    v-model="config.outputStyle"
                    :disabled="status.isLoading"
                    value=""
                  />
                  <span class="custom-radio"></span>
                  none
                </label>
              </div>
            </div>

            <!-- 코드 에디터 -->
            <div class="tf_custom">
              <monaco-editor
                editorId="inpTextarea"
                v-model="inputCode"
                :language="syntax"
                height="150px"
                ref="codeEditorRef"
              />
            </div>

            <!-- 로딩 표시 -->
            <div v-show="status.isLoading" class="ico_loader"></div>

            <!-- 결과 섹션 -->
            <div v-show="status.isLoaded" id="result" class="section_result">
              <h3 class="tit_paragraph">Result</h3>
              <template v-if="!status.isCssSyntaxError">
                <h4 class="screen_out">문법 오류</h4>
                <warning-list
                  :list="result.warnings"
                  :diff="hasDiff"
                ></warning-list>
                <h4 class="screen_out">위치</h4>
                <div id="diff" class="box_diff">
                  <monaco-diff-editor
                    v-show="!!inputCode"
                    editorId="editor"
                    :original-code="inputCode"
                    :modified-code="result.diff"
                    :language="syntax"
                    height="400px"
                    v-if="hasDiff"
                  />
                </div>
              </template>
              <div class="box_error" v-else>
                <strong class="emph_color">CSS Syntax Error 😢</strong>
                <span class="txt_message">
                  입력 값을 확인 후, 다시 시도해주세요.
                </span>
              </div>

              <!-- 규칙 버튼 -->
              <div class="wrap_btn">
                <button
                  type="button"
                  class="btn_type2"
                  @click="toggleRules"
                >
                  Rules
                  <span class="screen_out">
                    {{ status.isShowRules ? '접기' : '펼치기' }}
                  </span>
                </button>
              </div>

              <!-- 규칙 표시 -->
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

            <!-- 퀵 메뉴 네비게이션 -->
            <div v-show="status.isLoaded" class="nav_flow">
              <strong class="screen_out">퀵 메뉴</strong>
              <button
                class="btn_type2"
                type="button"
                @click="scrollToElement('#MongmungBody')"
              >
                TOP
              </button>
              <button
                class="btn_type2"
                type="button"
                @click="scrollToElement('#result')"
              >
                Result
              </button>
              <button
                v-show="!status.isCssSyntaxError"
                class="btn_type2"
                type="button"
                @click="scrollToElement('#diff')"
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
import { ref, nextTick, onMounted } from 'vue';
import { scrollToElement } from '../utils/scroll';
import { useToastNotification } from '../composables/useToastNotification';
import { useLint } from '../composables/useLint';
import { useSyntaxSelector } from '../composables/useSyntaxSelector';
import { SAMPLE_CODE } from '../config/constants';

import WarningList from '../components/WarningList.vue';
import AppFooter from '../components/AppFooter.vue';
import AppHeader from '../components/AppHeader.vue';
import MonacoEditor from '../components/MonacoEditor.vue';
import MonacoDiffEditor from '../components/MonacoDiffEditor.vue';
import SyntaxSelector from '../components/SyntaxSelector.vue';

// 상태 및 컴포저블 사용
const { showError } = useToastNotification();
const { status, result, config, hasDiff, runLint, resetLint, toggleRules } = useLint();
const { syntax, syntaxOptions, selectedSyntaxLabel, changeSyntax } = useSyntaxSelector();

// 에디터 및 사용자 입력
const inputCode = ref('');
const codeEditorRef = ref(null);

/**
 * 린트 실행 핸들러
 */
async function handleLint() {
  try {
    if (inputCode.value === '') {
      showError('코드를 입력해주세요.');
      return;
    }

    await runLint(inputCode.value, syntax.value);

    await nextTick();
    scrollToElement('#result');
  } catch (err) {
    console.error(err);
  }
}

/**
 * 초기화 핸들러
 */
async function handleClear() {
  resetLint();
  inputCode.value = '';
  syntax.value = 'css';
  await nextTick();
  scrollToElement('#MongmungBody');
}

/**
 * 샘플 코드 설정 핸들러
 */
function handleSample() {
  resetLint();
  inputCode.value = SAMPLE_CODE;
  syntax.value = 'html';
}

/**
 * 구문 선택 핸들러
 * @param {Object} option 선택된 옵션
 */
function handleSyntaxSelect(option) {
  changeSyntax(option.value);
}

onMounted(() => {
  // 페이지 로드 시 초기화
  nextTick();
});
</script>
