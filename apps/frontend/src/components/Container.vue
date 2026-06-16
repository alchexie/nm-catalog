<template>
  <div class="loading" v-if="loading">
    <div>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
  <template v-else><slot></slot></template>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();
</script>

<style>
.loading {
    position: absolute;
    inset: 0;
    height: 100vh;
    top: calc(var(--main-header-height) * -1);

  > div {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    gap: 8px;
    align-items: flex-end;
    transform: translateX(-50%) translateY(-50%);

    > span {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: currentColor;
      animation: bounce 2.8s ease infinite;

      &:nth-child(2) {
        animation-delay: 0.25s;
      }
      &:nth-child(3) {
        animation-delay: 0.5s;
      }
    }
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0);
  }
  21% {
    transform: translateY(-20px);
    animation-timing-function: cubic-bezier(0.33, 1, 0.66, 1);
  }
  42%,
  100% {
    transform: translateY(0);
  }
}
</style>
