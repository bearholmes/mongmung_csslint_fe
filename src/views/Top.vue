<template lang="pug">
  div
    #kakaoIndex
      //-- 웹접근성용 바로가기 링크 모음
      a(href="#kakaoBody") 본문 바로가기
    #kakaoWrap.lint_type1
      //-- position:relative 적용 / 레이아웃 관련 클래스 적용
      #kakaoHead.k_head(role="banner")
        h1.tit_cont Mongmung stylelint
        p.emph_desc CSS Convention &amp; HTML Attribute 우선순위 검사기
        span.badge_head 0.1 &beta;
      hr.hide/
      #kakaoContent.k_main(role="main")
        #cMain
          #mArticle.box_article
            h2#kakaoBody.screen_out Mongmung stylelint 본문
            .ico_loader(v-show="isLoading")
            h3.screen_out 입력
            .wrap_menu
              .opt_custom(ref="optLang")
                strong.screen_out 언어 선택상자
                em.screen_out 선택내용
                a.link_selected(href="javascript:;", @click="optToggle('optLang')", role="button") {{opt.syntax}}
                .layer_opt
                  ul.list_opt
                    li
                      a.link_opt(href="javascript:;" @click="selectOpt('optLang', 'syntax', 'css', 'CSS')" role="button") CSS
                    li
                      a.link_opt(href="javascript:;" @click="selectOpt('optLang', 'syntax', 'html', 'HTML+CSS')" role="button") HTML+CSS
              button.btn_type1(type="button" @click="lint()" :disabled="code === '' || isLoading") Lint
              button.btn_type2(type="button" @click="clear()" :disabled='isLoading') Clear
            .wrap_opt(style="display:none")
            .tf_custom
              textarea.tf_textarea(v-model="code")
            .wrap_btn
              button.btn_type1(type="button" @click="lint()" :disabled="code === '' || isLoading") Lint
              button.btn_type2(type="button" @click="clear()" :disabled="isLoading") Clear
              button.btn_type2(type="button" @click="sample()" :disabled="isLoading") Sample
            #result.section_result(v-show="!isFrist")
              h3.tit_paragraph Result
              h4.screen_out 문법 오류
              warning-list(:list.sync="result.warnings" :diff="result.diff.length === 0")
              h4.screen_out 위치
              #diff.box_diff(v-html="result.diff")
              template(v-if="result.diff.length > 0")
                .wrap_btn
                  button.btn_type1(type="button" @click="isCopy=!isCopy")
                    | 변환된 코드 전체보기
                    span.screen_out {{isCopy ? '닫기' : '열기'}}
                .tf_custom(v-show="isCopy")
                  textarea.tf_textarea(v-text="afterCode")
            .nav_flow(v-show="!isFrist")
              strong.screen_out 퀵 메뉴
              button.btn_type2(type="button" @click="goto('#kakaoBody')") TOP
              button.btn_type2(type="button" @click="goto('#result')") Result
              button.btn_type2(type="button" @click="goto('#diff')") Diff
      hr.hide/
      #kakaoFoot.k_foot(role="contentinfo")
        small.info_copy
          |
          a(href="https://github.com/bearholmes/mongmung_csslint_fe" target="_blank") &commat;Mongmung stylelint project
          | &nbsp;&vert; base on &nbsp;
          a(href="https://github.com/stylelint/stylelint" target="_blank") Stylelint
          | &nbsp;since.2019
</template>
<script>
import axios from 'axios';
import WarningList from '../components/WarningList';
import recommendedConfig from 'stylelint-config-recommended';
import scssRecommendedConfig from 'stylelint-config-recommended-scss';
import standardConfig from 'stylelint-config-standard';
import { scroller } from 'vue-scrollto/src/scrollTo';
import { Fragment } from 'vue-fragment';

const defaultConfig = {
  rules: Object.assign(recommendedConfig.rules, standardConfig.rules)
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

/**
 * 메인 화면
 */
export default {
  name: 'home',
  components: { WarningList, Fragment },
  data () {
    return {
      isFrist: true,
      isLoading: false,
      isCopy: false,
      config: {
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
            'background-size'
          ]
        }
      },
      syntax: 'css',
      code: '',
      afterCode: '',
      beforeCode: '',
      result: {
        warnings: [],
        diff: ''
      },
      opt: {
        syntax: 'CSS'
      }
    };
  },
  computed: {
    /**
     * 작성 언어 체크
     * @function
     * @returns {boolean}
     */
    editLang () {
      return this.syntax === 'html' ? 'html' : 'css';
    }
  },
  // 10/30 diff 코드하이라이트 기능 제거
  // directives: {
  //   highlight (el) {
  //     let blocks = el.querySelectorAll('code')
  //     blocks.forEach((block) => {
  //       hljs.highlightBlock(block)
  //     })
  //   }
  // },
  methods: {
    /**
     * 린트 실행 event
     * @public
     */
    lint () {
      this.isLoading = true;
      this.isCopy = false;
      this.result.warnings = [];
      if (this.syntax === 'scss') {
        const scssRules = Object.assign(
          defaultConfig.rules,
          scssRecommendedConfig.rules
        );
        this.config.rules = scssRules;
      }
      const lintConfig = {
        code: this.code,
        config: this.config || defaultConfig,
        syntax: this.syntax
      };
      axios
        .post(`/api/lint`, lintConfig, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          this.beforeCode = Object.freeze(this.code);
          this.result.warnings = Object.freeze(response.data.warnings);
          this.result.diff = Object.freeze(response.data.diff);
          this.isFrist = false;
          this.$nextTick(() => {
            this.goto('#result');
            this.isLoading = false;
            this.afterCode = Object.freeze(response.data.output);
          });
        })
        .catch(err => {
          this.isLoading = false;
          alert(err);
          console.log(err);
        });
    },
    /**
     * 초기화 event
     * @public
     */
    clear () {
      this.code = '';
      this.isFrist = true;
      this.isCopy = false;
      this.result.warnings = [];
      this.beforeCode = '';
      this.afterCode = '';
      this.syntax = 'css';
      this.opt.syntax = 'CSS';
      this.$nextTick(() => {
        this.goto('#kakaoBody');
      });
    },
    /**
     * 샘플 입력 event
     * @public
     */
    sample () {
      this.isCopy = false;
      this.syntax = 'html';
      this.opt.syntax = 'HTML+CSS';
      this.code = sampleCode;
    },
    /**
     * 디자인선택상자 토글 event
     * @arg {string} target
     * @public
     */
    optToggle (target) {
      this.$refs[target].classList.toggle('on');
    },
    /**
     * 디자인선택상자 값 선택 event
     * @param {string} target
     * @param {string} model v-model
     * @param {string} value
     * @param {string} name
     * @public
     */
    selectOpt (target, model, value, name) {
      this[model] = value;
      this.opt[model] = name;
      this.$refs[target].classList.remove('on');
    },
    /**
     * goto
     * @param {string} target \#id
     * @public
     */
    goto (target) {
      navScroller(target);
    }
  }
};
</script>
<style scoped>
@import url('Top.css');
@import url('~diff2html/dist/diff2html.min.css');
.badge_head {display:block;position:absolute;top:25px;left:275px;padding:2px 3px;border-radius:2px;font-size:12px;line-height:12px;color:#333;background-color:#ffef3f}
</style>
<style>
.d2h-file-wrapper{padding-bottom:2px}
.d2h-file-header{height:18px}
.d2h-changed-tag{padding:0 5px}
.d2h-diff-table{font-size:11px}
</style>
