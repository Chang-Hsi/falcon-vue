<template>
  <div
    class="flex w-full items-center justify-center gap-2 border-t border-slate-100 bg-white px-4 py-3"
  >
    <button
      type="button"
      class="btn btn-sm btn-ghost rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      :disabled="page <= 1"
      @click="emitChange(page - 1)"
      aria-label="Previous page"
    >
      <ChevronLeftIcon class="h-5 w-5" />
    </button>

    <button
      v-for="p in pages"
      :key="p"
      type="button"
      class="btn btn-sm rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
      :class="p === page ? 'bg-blue-600 text-slate-500 border-blue-600' : ''"
      @click="emitChange(p)"
    >
      {{ p }}
    </button>

    <button
      type="button"
      class="btn btn-sm btn-ghost rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      :disabled="page >= pageCount"
      @click="emitChange(page + 1)"
      aria-label="Next page"
    >
      <ChevronRightIcon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    page: number;
    pageCount: number;
    windowSize?: number;
  }>(),
  {
    windowSize: 5,
  }
);

const emit = defineEmits<{
  (e: "change", page: number): void;
}>();

const pages = computed(() => {
  const total = Math.max(1, Number(props.pageCount) || 1);
  const cur = Math.min(Math.max(1, Number(props.page) || 1), total);
  const win = Math.max(3, Number(props.windowSize) || 5);

  const start = Math.max(1, cur - Math.floor(win / 2));
  const end = Math.min(total, start + win - 1);
  const fixedStart = Math.max(1, end - win + 1);

  const arr: number[] = [];
  for (let i = fixedStart; i <= end; i++) arr.push(i);
  return arr;
});

function emitChange(p: number) {
  const total = Math.max(1, Number(props.pageCount) || 1);
  const next = Math.min(Math.max(1, Number(p) || 1), total);
  if (next === props.page) return;
  emit("change", next);
}
</script>
