<template>
  <div id="top-mark" ref="topRef"></div>
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
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { LangCode, LangNameMap, type LangCodeValue } from '@/types';
import { getLocale, useLangStore } from '@/stores';
import { scrollToY } from '@/utils/dom-utils';
import { ElementTracker } from '@/utils/element-tracker';
import type { LocaleType } from '@/i18n';

const { t } = useI18n();
const langStore = useLangStore();
const langList = Object.values(LangCode);
const mainLang = ref<LangCodeValue>(langStore.mainLang);
const topRef = ref<HTMLElement>();
const isScrollTop = ref<boolean>(false);
const tracker = new ElementTracker((entries) => {
  const entry = entries[0];
  isScrollTop.value = entry.isIntersecting;
});

onMounted(async () => {
  langStore.setLangList(langList);
  tracker.observe(topRef.value as unknown as HTMLElement);
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
@use '@/styles/variables' as *;

#top-mark {
  position: absolute;
  top: 0;
  width: 1px;
  height: 1px;
}

#footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: var(--main-footer-height);
  background-color: rgba(black, 0.9);
  font-size: small;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0 auto;
    padding: 0 var(--root-gap-width-0);
    color: var(--root-text-color-light);

    > label {
      margin-left: auto;

      select {
        margin-right: 2rem;
      }
    }

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      cursor: pointer;
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
