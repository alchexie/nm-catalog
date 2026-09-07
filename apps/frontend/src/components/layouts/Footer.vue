<template>
  <footer id="footer">
    <div>
      <span>
        Fan project since 2025. Not an official site.
        <span class="hidden-sm">
          Data only, no music included.
          <b>All data belongs to Nintendo.</b>
        </span>
      </span>
      <label>
        {{ t('info.lang') }}{{ t('punctuation.colon') }}
        <select name="lang" v-model="mainLang" @change="onLangChange">
          <option
            v-for="[key, name] in Object.entries(LangNameMap)"
            :key="key"
            :value="key"
          >
            {{ name }}
          </option>
        </select>
        <span :style="{ opacity: isScrollTop ? 0.5 : 1 }" @click.stop="scrollToTop()">
          {{ t('info.top') }} ↑
        </span>
      </label>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLocale, useLangStore } from '@/stores';
import { LangCode, LangNameMap, type LangCodeValue } from '@/types';
import { getScrollTop, scrollToY } from '@/utils/dom-utils';
import type { LocaleType } from '@/i18n';

const { t } = useI18n();
const langStore = useLangStore();

const mainLang = ref<LangCodeValue>(langStore.mainLang);
const isScrollTop = ref<boolean>(true);

const onScroll = () => {
  isScrollTop.value = getScrollTop() === 0;
};

onMounted(async () => {
  langStore.setLangList(Object.values(LangCode));
  window.addEventListener('scroll', onScroll, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, true);
});

function onLangChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  langStore.setMainLang(value as LangCodeValue);
  langStore.setLocale(getLocale(value as LocaleType), true);
}

function scrollToTop() {
  scrollToY(0);
}
</script>

<style lang="scss" scoped>
#footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: var(--main-footer-height);
  background-color: rgba(black, 0.85);
  font-size: small;

  > div {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 var(--root-gap-width-0);
    color: var(--root-text-color-light);

    span {
      display: inline-block;
    }

    > label {
      margin-left: auto;
      white-space: nowrap;

      select {
        margin-right: 2rem;
      }

      span {
        cursor: pointer;
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  #footer {
    height: 4.5em;

    > div {
      flex-direction: column-reverse;
      line-height: 2em;

      > label {
        margin-left: initial;
      }
    }
  }
}
</style>
