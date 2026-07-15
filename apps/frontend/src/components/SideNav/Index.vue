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
      <img v-if="data.imgUrl" v-fallback :src="data.imgUrl" loading="lazy" />
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
      <template v-for="(option, i) in options" :key="option.label">
        <li
          v-if="props.options[i].count"
          :class="{ active: i === activeIndex }"
          :style="{
            transform: `translateY(${
              navheight * (percentages[i] + (1 - percentages[options.length - 1]) / 2)
            }px)`,
          }"
          @click.stop="navigateTo(i)"
        >
          <span :title="props.options[i].label">{{ props.options[i].label }} </span>
          <span class="badge">{{ props.options[i].count }} </span>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useNavigation } from '@/composables/useNavigation';
import SvgIcon from '@/components/SvgIcon.vue';
import { ElementTracker } from '@/utils/element-tracker';
import { scrollToY } from '@/utils/dom-utils';

const { t } = useI18n();
const { setRouteScroll, getRouteScroll } = useNavigation();
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
  options: { label: string; count: number }[];
  targetNodes?: HTMLElement[];
}>();
const emit = defineEmits(['update:sort']);
const currentRoutePath = useRoute().path;
const showSortMenu = ref(false);
const percentages = ref<number[]>([]);
const navheight = ref<number>(0);
const activeIndex = ref<number>(0);
const navListRef = ref<HTMLUListElement>();
const showTopFade = ref(false);
const showBottomFade = ref(false);
const tracker = new ElementTracker((entries) => {
  const entry = entries.find((x) => x.isIntersecting);
  if (entry) {
    const idx = Math.floor(
      (props.targetNodes ?? []).indexOf(entry!.target as HTMLElement)
    );
    activeIndex.value = idx;
  }
});
let scrollHandler!: (() => void) | null;

const computedSortLabel = computed(() => {
  return props.sortConfig?.options.find((x) => x.value === props.sortConfig?.current)
    ?.label;
});

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
  () => props.targetNodes ?? [],
  async (elRef) => {
    tracker.disconnect();
    activeIndex.value = 0;
    if (elRef?.length) {
      const nums: number[] = [0];
      const sum = elRef
        .map((x) => x.offsetHeight)
        .reduce((a, b) => {
          nums.push(a);
          return a + b;
        });
      percentages.value = nums.map((x) => x / sum);
      await nextTick();
      tracker.observe(elRef);
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

async function navigateTo(idx: number) {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  activeIndex.value = idx;
  tracker.disconnect();

  if (!props.targetNodes) {
    return;
  }
  const el = props.targetNodes[idx];
  scrollToY(el.getBoundingClientRect().top + window.scrollY - 80, () => {
    scrollHandler = () => {
      window.removeEventListener('scroll', scrollHandler!);
      tracker.reconnect();
    };
    setTimeout(() => {
      window.addEventListener('scroll', scrollHandler!);
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
</script>

<style lang="scss" scoped src="./styles.scss"></style>
