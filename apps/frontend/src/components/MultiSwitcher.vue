<template>
  <a :class="{ expand: expand }">
    <span
      v-for="option in options"
      :key="option"
      :class="{ active: modelValue === option }"
      :title="t(`${descPrefix}.${option.toUpperCase()}`)"
      @click="$emit('update:modelValue', option)"
    >
      <SvgIcon :type="option" width="16px"></SvgIcon>
    </span>
  </a>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SvgIcon from '@/components/SvgIcon.vue';

defineProps<{
  options: string[];
  descPrefix: string;
  modelValue?: string;
  expand?: boolean;
}>();

defineEmits<{
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
  }

  > span {
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
