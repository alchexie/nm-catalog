<template>
  <a :class="{ expand: props.expand }">
    <span
      v-for="option in props.options"
      :key="option"
      :class="{ active: props.modelValue === option }"
      :title="t(`${props.descPrefix}.${option.toUpperCase()}`)"
      @click="emit('update:modelValue', option)"
    >
      <SvgIcon :type="option" width="16px"></SvgIcon>
    </span>
  </a>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/base/SvgIcon.vue';

import { useI18n } from 'vue-i18n';

const props = defineProps<{
  options: string[];
  descPrefix: string;
  modelValue?: string;
  expand?: boolean;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
a {
  display: inline-flex;
  border-radius: 9999px;
  background-color: var(--root-bg-color-2);

  > span {
    @include flexContentCenter();
    justify-content: center;
    width: 36px;
    height: 28px;
    border-radius: 9999px;
    cursor: pointer;

    &.active {
      background-color: var(--root-bg-color-4);
    }

    &:hover {
      background-color: var(--root-bg-color-5);
    }
  }
}

@media (max-width: $breakpoint-md) {
  a {
    &.expand {
      > span {
        width: 108px;
      }
    }
  }
}
</style>
