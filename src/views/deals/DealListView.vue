<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-center justify-between pt-2">
      <div class="text-[22px] font-extrabold tracking-wide text-slate-900">店家管理</div>

      <button
        type="button"
        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        @click="goCreate()"
      >
        <PlusIcon class="h-5 w-5" />
        新增店家
      </button>
    </div>

    <div
      class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div class="flex w-full flex-wrap items-end gap-3">
        <div class="flex w-60 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">關鍵字</div>
          <input
            v-model="draft.keyword"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="店名 / ID / 電話 / 地址"
          />
        </div>

        <div class="flex w-50 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">狀態</div>
          <select
            v-model="draft.status"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">全部</option>
            <option value="enabled">上架</option>
            <option value="disabled">下架</option>
          </select>
        </div>

        <div class="flex w-55 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">主分類</div>
          <select
            v-model="draft.categoryMainId"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
            @change="onMainChanged"
          >
            <option value="">全部</option>
            <option v-for="c in store.categoryMain" :key="c.id" :value="c.id">
              {{ c.label }}
            </option>
          </select>
        </div>

        <div class="flex w-55 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">子分類</div>
          <select
            v-model="draft.categorySubId"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
            :disabled="!draft.categoryMainId"
          >
            <option value="">全部</option>
            <option v-for="c in subOptions" :key="c.id" :value="c.id">
              {{ c.label }}
            </option>
          </select>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <button
            type="button"
            class="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            @click="applyFilters()"
          >
            查詢
          </button>

          <button
            type="button"
            class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            @click="resetFilters()"
          >
            重置
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="w-full overflow-auto">
        <table class="table table-zebra w-full min-w-300">
          <thead>
            <tr class="bg-slate-50 text-xs font-extrabold text-slate-500">
              <th class="w-14">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="store.isAllSelectedOnPage"
                  @click="toggleSelectAll($event)"
                />
              </th>

              <th class="min-w-80">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('name')"
                  :title="sortTitle('name', '店家')"
                >
                  <span>店家</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("name") }}</span>
                </button>
              </th>

              <th class="min-w-55">分類</th>

              <th class="min-w-22.5">精選</th>

              <th class="min-w-22.5">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('rating')"
                  :title="sortTitle('rating', '評分')"
                >
                  <span>評分</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("rating") }}</span>
                </button>
              </th>

              <th class="min-w-27.5">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('distance')"
                  :title="sortTitle('distance', '距離')"
                >
                  <span>距離</span>
                  <span class="text-[10px] leading-none">{{
                    sortSymbol("distance")
                  }}</span>
                </button>
              </th>

              <th class="min-w-22.5">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('dealCount')"
                  :title="sortTitle('dealCount', '優惠')"
                >
                  <span>優惠</span>
                  <span class="text-[10px] leading-none">{{
                    sortSymbol("dealCount")
                  }}</span>
                </button>
              </th>

              <th class="min-w-22.5">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('ticketCount')"
                  :title="sortTitle('ticketCount', '票券')"
                >
                  <span>票券</span>
                  <span class="text-[10px] leading-none">{{
                    sortSymbol("ticketCount")
                  }}</span>
                </button>
              </th>

              <th class="min-w-22.5">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('status')"
                  :title="sortTitle('status', '狀態')"
                >
                  <span>狀態</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("status") }}</span>
                </button>
              </th>

              <th class="min-w-37.5">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('updatedAt')"
                  :title="sortTitle('updatedAt', '更新時間')"
                >
                  <span>更新時間</span>
                  <span class="text-[10px] leading-none">{{
                    sortSymbol("updatedAt")
                  }}</span>
                </button>
              </th>

              <th class="w-18"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="d in store.pageItems"
              :key="d.id"
              class="text-sm text-slate-700 hover:bg-slate-50"
              style="cursor: pointer"
              @click="goEdit(d.id)"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="store.isSelected(d.id)"
                  @click="toggleRowSelect($event, d.id)"
                />
              </td>

              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="h-9 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <img
                      :src="d.coverUrl"
                      alt="cover"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="flex min-w-0 flex-col">
                    <div class="truncate font-bold text-slate-900">{{ d.name }}</div>
                    <div class="truncate text-xs text-slate-500">ID：{{ d.id }}</div>
                  </div>

                  <span
                    v-if="d.badge"
                    class="ml-2 hidden max-w-80 truncate rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 sm:inline-flex"
                    :title="d.badge"
                  >
                    {{ d.badge }}
                  </span>
                </div>
              </td>

              <td>
                <div class="flex flex-col gap-1">
                  <div class="text-xs font-semibold text-slate-800">
                    {{ store.categoryMainLabelMap[d.categoryMainId] || d.categoryMainId }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{
                      store.categorySubLabelMap[d.categoryMainId]?.[d.categorySubId] ||
                      d.categorySubId
                    }}
                  </div>
                </div>
              </td>

              <td>
                <span
                  v-if="d.isFeatured"
                  class="rounded-full bg-blue-50 px-2 py-1 text-xs font-extrabold text-blue-700"
                >
                  精選
                </span>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>

              <td class="font-semibold text-slate-900">{{ d.rating.toFixed(1) }}</td>
              <td class="font-semibold text-slate-900">{{ d.distanceText }}</td>
              <td class="font-semibold text-slate-900">{{ d.stats.dealCount }}</td>
              <td class="font-semibold text-slate-900">{{ d.stats.ticketCount }}</td>

              <td>
                <span
                  class="rounded-full px-2 py-1 text-xs font-extrabold"
                  :class="
                    d.status === 'enabled'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  "
                >
                  {{ d.status === "enabled" ? "上架" : "下架" }}
                </span>
              </td>

              <td class="text-xs text-slate-500">{{ d.updatedAt }}</td>

              <td @click.stop>
                <button
                  type="button"
                  class="btn btn-sm btn-ghost flex h-8 w-8 items-center justify-center"
                  @click="openRowMenu($event, d.id)"
                  title="操作"
                >
                  <EllipsisHorizontalIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.pageItems.length">
              <td colspan="11" class="py-10 text-center text-sm text-slate-500">
                沒有符合條件的店家
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :page="store.page"
        :page-count="store.pageCount"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watchEffect } from "vue";
import { useRouter } from "vue-router";
import AppPagination from "@/components/common/AppPagination.vue";
import { useAdminDealStore } from "@/stores/adminDealStore";
import { PlusIcon, EllipsisHorizontalIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const store = useAdminDealStore();

const draft = reactive({
  keyword: store.filters.keyword,
  status: store.filters.status,
  categoryMainId: store.filters.categoryMainId,
  categorySubId: store.filters.categorySubId,
  featuredOnly: store.filters.featuredOnly,
});

watchEffect(() => {
  void store.pageItems;
});

const subOptions = computed(() => {
  if (!draft.categoryMainId) return [];
  return store.subOptions(draft.categoryMainId);
});

function onMainChanged() {
  draft.categorySubId = "";
}

function applyFilters() {
  store.setFilters({
    keyword: draft.keyword,
    status: draft.status,
    categoryMainId: draft.categoryMainId,
    categorySubId: draft.categorySubId,
    featuredOnly: draft.featuredOnly,
  });
  store.applyFilters();
}

function resetFilters() {
  store.resetFilters();
  draft.keyword = store.filters.keyword;
  draft.status = store.filters.status;
  draft.categoryMainId = store.filters.categoryMainId;
  draft.categorySubId = store.filters.categorySubId;
  draft.featuredOnly = store.filters.featuredOnly;
}

function goCreate() {
  router.push("/deals/create");
}

function goEdit(id: string) {
  router.push(`/deals/${id}/edit`);
}

function toggleRowSelect(e: MouseEvent, id: string) {
  e.stopPropagation();
  store.toggleSelect(id);
}

function toggleSelectAll(e: MouseEvent) {
  e.stopPropagation();
  store.toggleSelectAllOnPage();
}

function openRowMenu(e: MouseEvent, id: string) {
  e.stopPropagation();
  console.log("[店家列表] row menu", id);
}

function onPageChange(p: number) {
  store.setPage(p);
}

function toggleSort(key: string) {
  store.toggleSort(key);
}

function sortSymbol(key: string) {
  if (store.sort.key !== key) return "⇅";
  if (store.sort.dir === "asc") return "▲";
  if (store.sort.dir === "desc") return "▼";
  return "⇅";
}

function sortTitle(key: string, label: string) {
  if (store.sort.key !== key) return `排序：${label}（點擊：升冪）`;
  if (store.sort.dir === "asc") return `排序：${label}（目前升冪，點擊：降冪）`;
  if (store.sort.dir === "desc") return `排序：${label}（目前降冪，點擊：清除排序）`;
  return `排序：${label}`;
}
</script>
