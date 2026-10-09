<template>
  <nav id="side-nav" :class="{ hidden: options.length === 1 }">
    <section>
      <h1>
        {{ data.title }}
        <template v-if="props.sortConfig">
          <a
            class="sorter"
            :class="{ active: showSortMenu }"
            @click.stop="showSortMenu = !showSortMenu"
          >
            {{ computedSortLabel }}
            <ul :class="{ active: showSortMenu }">
              <li
                v-for="option in props.sortConfig?.options"
                :key="option.value"
                :class="{ active: option.value === sortConfig?.current }"
                @click.stop="onSelectSort(option.value)"
              >
                <span>{{ option.label }}</span>
              </li>
            </ul>
          </a>
        </template>
      </h1>
      <h2 v-if="data.subTitle">{{ data.subTitle }}</h2>
      <img v-if="data.imgUrl" v-fallback :src="data.imgUrl" />
      <template v-if="data.officialUrl">
        <a v-external-link class="outer-link" :href="data.officialUrl">
          <SvgIcon type="link" height="1.5em"></SvgIcon>
          {{ t('official.link') }}
        </a>
      </template>
    </section>
    <ul
      ref="navListRef"
      :class="{ 'fade-top': showTopFade, 'fade-bottom': showBottomFade }"
      @scroll="onNavScroll"
      @wheel="onWheel"
    >
      <template v-for="(option, i) in options" :key="option.key">
        <li
          v-if="option.count"
          class="option"
          :class="{ active: option.key === activeKey }"
          @click.stop="navigateTo(option.key)"
        >
          <span :title="option.label">{{ option.label }}</span>
          <span class="badge">{{ option.count }}</span>
        </li>
        <li v-else-if="option.children" :class="{ expanded: expandedSet.has(i) }">
          <span class="option" :title="option.label" @click.stop="toggleNav(i)">
            {{ option.label }}
            <SvgIcon class="chevron" type="right" width="0.75em" />
          </span>
          <ul>
            <li
              v-for="child in option.children"
              :key="child.key"
              class="option"
              :class="{ active: child.key === activeKey }"
              @click.stop="navigateTo(child.key)"
            >
              <span :title="child.label">{{ child.label }}</span>
              <span class="badge">{{ child.count }}</span>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script lang="ts">
interface SideNavOptionBase {
  label: string;
  key: string;
}
interface SideNavOptionWithCount extends SideNavOptionBase {
  count: number;
  children?: never;
}
interface SideNavOptionWithChildren extends SideNavOptionBase {
  count?: never;
  children: SideNavOptionWithCount[];
}
export type SideNavOption = SideNavOptionWithCount | SideNavOptionWithChildren;
</script>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useNavigation } from '@/composables/useNavigation';
import { ElementTracker } from '@/utils/element-tracker';
import { getScrollContainer, getScrollTop, scrollToY } from '@/utils/dom-utils';

const props = defineProps<{
  data: {
    title: string;
    subTitle?: string;
    imgUrl?: string;
    officialUrl?: string;
  };
  sortConfig?: {
    options: { label: string; value: string }[];
    current: string;
  };
  options: SideNavOption[];
  targetNodes?: Record<string, HTMLElement>;
}>();
const emit = defineEmits(['update:sort']);

const { t } = useI18n();
const { setRouteScroll, getRouteScroll } = useNavigation();
const currentRoutePath = useRoute().path;

const showSortMenu = ref(false);
const activeKey = ref('');
const navListRef = ref<HTMLUListElement>();
const showTopFade = ref(false);
const showBottomFade = ref(false);
const expandedSet = ref(new Set<number>());

const computedSortLabel = computed(() => {
  return props.sortConfig?.options.find((x) => x.value === props.sortConfig?.current)
    ?.label;
});
const computedTargetElements = computed(() =>
  props.options
    .flatMap((o) => o.children ?? [o])
    .map((leaf) => ({ key: leaf.key, el: props.targetNodes?.[leaf.key] }))
    .filter((x): x is { key: string; el: HTMLElement } => !!x.el)
);

const tracker = new ElementTracker((entries) => {
  const entry = entries.find((x) => x.isIntersecting);
  if (entry) {
    const key = computedTargetElements.value.find((x) => x.el === entry.target)?.key;
    if (key) {
      activeKey.value = key;
    }
  }
});
let scrollHandler!: (() => void) | null;

onMounted(() => {
  if (!props.sortConfig) return;
  document.addEventListener('click', onClickOutside);
  navListRef.value?.scrollTo(0, getRouteScroll(currentRoutePath));
});

onBeforeUnmount(() => {
  if (!props.sortConfig) return;
  document.removeEventListener('click', onClickOutside);
  setRouteScroll(currentRoutePath, navListRef.value?.scrollTop ?? 0);
});

watch(
  computedTargetElements,
  async (elements) => {
    tracker.disconnect();
    activeKey.value = '';
    if (elements.length) {
      await nextTick();
      tracker.observe(elements.map((x) => x.el));
    }
  },
  { immediate: true }
);

watch(
  () => props.options,
  async () => {
    showTopFade.value = false;
    showBottomFade.value = false;
    await nextTick();
    navListRef.value?.scrollTo(0, 0);
  }
);

async function navigateTo(key: string) {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  activeKey.value = key;
  tracker.disconnect();

  const el = props.targetNodes?.[key];
  if (!el) return;

  scrollToY(el.getBoundingClientRect().top + getScrollTop() - 80, () => {
    scrollHandler = () => {
      getScrollContainer().removeEventListener('scroll', scrollHandler!);
      tracker.reconnect();
    };
    setTimeout(() => {
      getScrollContainer().addEventListener('scroll', scrollHandler!);
    }, 500);
  });
}

function onSelectSort(value: string) {
  emit('update:sort', value);
  showSortMenu.value = false;
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.sorter')) {
    showSortMenu.value = false;
  }
}

function onNavScroll() {
  const el = navListRef.value;
  if (!el) return;
  showTopFade.value = el.scrollTop > 0;
  showBottomFade.value = el.scrollTop < el.scrollHeight - el.clientHeight - 1;
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  e.stopPropagation();
  const el = navListRef.value;
  if (el) {
    el.scrollTop += e.deltaY;
    onNavScroll();
  }
}

function toggleNav(optionIndex: number) {
  if (expandedSet.value.has(optionIndex)) {
    expandedSet.value.delete(optionIndex);
  } else {
    expandedSet.value.add(optionIndex);
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
