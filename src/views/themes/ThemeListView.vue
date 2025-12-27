<template>
  <div class="flex w-full flex-col gap-4">
    <div class="text-[22px] font-extrabold tracking-wide text-slate-900 pt-3">
      主題 / 輪播管理
    </div>
    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full flex-col gap-3 md:flex-row md:items-center">
        <div class="flex w-full flex-1 items-center gap-2">
          <input
            v-model="filters.keyword"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none ring-0 transition focus:border-slate-400"
            placeholder="搜尋：主題標題 / 副標"
          />

          <select
            v-model="filters.status"
            class="h-10 w-37.5 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400"
          >
            <option value="">全部狀態</option>
            <option value="enabled">啟用</option>
            <option value="disabled">停用</option>
          </select>

          <button
            type="button"
            class="h-10 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            @click="resetFilters"
          >
            清除
          </button>
        </div>

        <div class="flex w-full justify-end md:w-auto">
          <button
            type="button"
            class="flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            @click="goCreate"
          >
            新增主題
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
    >
      <div
        class="flex w-full items-center border-b border-slate-200 bg-slate-50 px-5 py-3"
      >
        <div
          class="flex w-full items-center gap-2 text-[13px] font-semibold text-slate-700"
        >
          <span class="w-10 text-center">排序</span>
          <span class="min-w-0 flex-1">主題</span>
          <span class="w-27.5 text-center">狀態</span>
          <span class="w-40 text-center">更新時間</span>
          <span class="w-55 text-right">操作</span>
        </div>
      </div>

      <div class="flex w-full flex-col">
        <draggable
          v-model="dragList"
          item-key="id"
          handle=".drag-handle"
          class="flex w-full flex-col"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div
              class="flex w-full items-center gap-2 border-b border-slate-100 px-5 py-3 last:border-b-0"
            >
              <div class="flex w-10 shrink-0 items-center justify-center">
                <button
                  type="button"
                  class="drag-handle cursor-grab rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 active:cursor-grabbing"
                  aria-label="drag"
                >
                  ☰
                </button>
              </div>

              <button
                type="button"
                class="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
                @click="openPreview(element.id)"
              >
                <div class="line-clamp-1 text-[14px] font-bold text-slate-900">
                  {{ element.title }}
                </div>
                <div class="line-clamp-1 text-[12px] text-slate-500">
                  {{ element.subtitle }}
                </div>
              </button>

              <div class="flex w-27.5 shrink-0 items-center justify-center">
                <span
                  class="rounded-full px-3 py-1 text-[12px] font-semibold"
                  :class="
                    element.status === 'enabled'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                  "
                >
                  {{ element.status === "enabled" ? "啟用" : "停用" }}
                </span>
              </div>

              <div class="w-40 shrink-0 text-center text-[12px] text-slate-500">
                {{ element.updatedAt }}
              </div>

              <div class="flex w-55 shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  @click="openPreview(element.id)"
                >
                  預覽
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  @click="goDetail(element.id)"
                >
                  詳情
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                  @click="goEdit(element.id)"
                >
                  編輯
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <div
          v-if="!dragList.length"
          class="flex w-full flex-col items-center justify-center gap-2 px-6 py-10"
        >
          <div class="text-[14px] font-semibold text-slate-700">沒有符合條件的主題</div>
          <div class="text-[12px] text-slate-500">你可以調整搜尋條件或新增主題</div>
          <button
            type="button"
            class="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            @click="goCreate"
          >
            新增主題
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-50 flex items-stretch justify-end"
      @mousedown.self="closePreview"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>

      <div
        class="relative flex h-full w-full max-w-110 flex-col bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div
          class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="line-clamp-1 text-[16px] font-extrabold text-slate-900">
              {{ activeTheme?.title || "主題預覽" }}
            </div>
            <div class="line-clamp-1 text-[12px] text-slate-500">
              {{ activeTheme?.subtitle || "" }}
            </div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 active:scale-[0.98]"
            @click="closePreview"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        <div class="flex min-h-0 w-full flex-1 flex-col overflow-auto px-5 py-4">
          <div class="flex w-full flex-col gap-3">
            <div class="overflow-hidden rounded-2xl ring-1 ring-slate-100">
              <img
                v-if="activeTheme?.heroImageUrl"
                :src="activeTheme.heroImageUrl"
                :alt="activeTheme.title"
                class="h-44 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div
                v-else
                class="flex h-44 w-full items-center justify-center bg-slate-50 text-[12px] text-slate-500"
              >
                尚未設定主視覺圖片
              </div>
            </div>

            <div class="flex w-full items-center justify-between">
              <div class="text-[13px] font-bold text-slate-900">卡片縮圖（最多 3）</div>
              <div class="text-[12px] text-slate-500">
                {{ activeTheme?.cards?.length || 0 }} 張
              </div>
            </div>

            <div class="flex w-full flex-col gap-2">
              <div
                v-for="c in previewCards"
                :key="c.id"
                class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div class="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  <img
                    v-if="c.imageUrl"
                    :src="c.imageUrl"
                    :alt="c.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="line-clamp-1 text-[13px] font-bold text-slate-900">
                    {{ c.name }}
                  </div>
                  <div class="line-clamp-1 text-[12px] text-slate-500">
                    {{ c.category }}
                  </div>
                  <div class="flex items-center gap-3 text-[12px] text-slate-600">
                    <div class="flex items-center gap-1">
                      <span class="text-orange-500">★</span>
                      <span class="font-semibold">{{ c.rating }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span>◎</span>
                      <span>{{ c.distance }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="!previewCards.length"
                class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[12px] text-slate-500"
              >
                尚未設定卡片
              </div>
            </div>

            <div class="mt-2 flex w-full items-center justify-between">
              <div class="text-[13px] font-bold text-slate-900">店家（前 5 筆）</div>
              <div class="text-[12px] text-slate-500">
                {{ activeTheme?.stores?.length || 0 }} 筆
              </div>
            </div>

            <div class="flex w-full flex-col gap-2">
              <div
                v-for="s in previewStores"
                :key="s.id"
                class="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="line-clamp-1 text-[13px] font-bold text-slate-900">
                    {{ s.name }}
                  </div>
                  <div class="line-clamp-1 text-[12px] text-slate-500">
                    {{ s.categoryMain }} / {{ s.categorySub }}
                  </div>
                </div>
                <div class="shrink-0 text-[12px] font-semibold text-slate-700">
                  {{ s.rating }}
                </div>
              </div>

              <div
                v-if="!previewStores.length"
                class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[12px] text-slate-500"
              >
                尚未設定店家
              </div>
            </div>

            <div class="mt-4 flex w-full items-center gap-2">
              <button
                type="button"
                class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                :disabled="!activeTheme"
                @click="activeTheme && goDetail(activeTheme.id)"
              >
                進入詳情
              </button>

              <button
                type="button"
                class="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                :disabled="!activeTheme"
                @click="activeTheme && goEdit(activeTheme.id)"
              >
                編輯
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 px-5 py-3 text-[12px] text-slate-500">
          更新時間：{{ activeTheme?.updatedAt || "—" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";
import { useAdminThemeStore, type AdminTheme, type ThemeFilters } from "@/stores/adminThemeStore";

const router = useRouter();
const store = useAdminThemeStore();

const filters = reactive<ThemeFilters>({
  keyword: store.filters.keyword,
  status: store.filters.status,
});

watch(
  () => ({ ...filters }),
  (v) => {
    store.setFilters(v);
  },
  { deep: true }
);

const themeCount = computed(() => store.filteredThemes.length);

const drawerOpen = computed(() => store.drawerOpen);
const activeTheme = computed(() => store.activeTheme);

const previewCards = computed(() => (activeTheme.value?.cards || []).slice(0, 3));
const previewStores = computed(() => (activeTheme.value?.stores || []).slice(0, 5));

const dragList = ref<AdminTheme[]>(store.filteredThemes);

watch(
  () => store.filteredThemes,
  (list) => {
    dragList.value = list.slice();
  },
  { immediate: true }
);

function resetFilters() {
  filters.keyword = "";
  filters.status = "";
  store.clearFilters();
}

function openPreview(id: string) {
  store.openDrawerById(id);
}

function closePreview() {
  store.closeDrawer();
}

function onDragEnd() {
  store.reorderThemesByList(dragList.value);
}

function goCreate() {
  router.push({ name: "ThemeCreate" });
}

function goDetail(id: string) {
  store.closeDrawer();
  router.push({ name: "ThemeDetail", params: { id } });
}

function goEdit(id: string) {
  store.closeDrawer();
  router.push({ name: "ThemeEdit", params: { id } });
}
</script>
