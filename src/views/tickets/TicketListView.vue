<!-- src/views/tickets/TicketListView.vue -->
<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-center justify-between pt-2">
      <div class="text-[22px] font-extrabold tracking-wide text-slate-900">票券管理</div>

      <button
        type="button"
        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        @click="goCreate()"
      >
        <PlusIcon class="h-5 w-5" />
        新增票券
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
            placeholder="票券名稱 / ID / 副標"
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
            <option value="draft">草稿</option>
          </select>
        </div>

        <div class="flex w-55 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">品牌</div>
          <select
            v-model="draft.brandId"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">全部</option>
            <option v-for="b in store.brands" :key="b.id" :value="b.id">
              {{ b.label }}
            </option>
          </select>
        </div>

        <div class="flex w-55 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">效期</div>
          <select
            v-model="draft.validState"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">全部</option>
            <option value="valid">有效</option>
            <option value="soon">即將到期（7天內）</option>
            <option value="expired">已過期</option>
          </select>
        </div>

        <div class="flex w-60 flex-col gap-1">
          <div class="text-xs font-bold text-slate-600">點數區間</div>
          <div class="flex w-full items-center gap-2">
            <input
              v-model="draft.pointsMin"
              inputmode="numeric"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="最小"
            />
            <div class="text-xs text-slate-400">—</div>
            <input
              v-model="draft.pointsMax"
              inputmode="numeric"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="最大"
            />
          </div>
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
        <table class="table table-zebra w-full min-w-275">
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
                  @click.stop="toggleSort('title')"
                  :title="sortTitle('title', '票券')"
                >
                  <span>票券</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("title") }}</span>
                </button>
              </th>

              <th class="min-w-40">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('brand')"
                  :title="sortTitle('brand', '品牌')"
                >
                  <span>品牌</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("brand") }}</span>
                </button>
              </th>

              <th class="min-w-24">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('points')"
                  :title="sortTitle('points', '點數')"
                >
                  <span>點數</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("points") }}</span>
                </button>
              </th>

              <th class="min-w-34">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('validTo')"
                  :title="sortTitle('validTo', '到期日')"
                >
                  <span>到期日</span>
                  <span class="text-[10px] leading-none">{{
                    sortSymbol("validTo")
                  }}</span>
                </button>
              </th>

              <th class="min-w-24">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('stock')"
                  :title="sortTitle('stock', '庫存')"
                >
                  <span>庫存</span>
                  <span class="text-[10px] leading-none">{{ sortSymbol("stock") }}</span>
                </button>
              </th>

              <th class="min-w-24">
                <button
                  type="button"
                  class="flex items-center gap-2"
                  @click.stop="toggleSort('redeemedCount')"
                  :title="sortTitle('redeemedCount', '已兌換')"
                >
                  <span>已兌換</span>
                  <span class="text-[10px] leading-none">{{
                    sortSymbol("redeemedCount")
                  }}</span>
                </button>
              </th>

              <th class="min-w-26">
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

              <th class="min-w-40">
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
              v-for="t in store.pageItems"
              :key="t.id"
              class="text-sm text-slate-700 hover:bg-slate-50"
              style="cursor: pointer"
              @click="goEdit(t.id)"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="store.isSelected(t.id)"
                  @click="toggleRowSelect($event, t.id)"
                />
              </td>

              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <img
                      :src="t.imageUrl"
                      alt="ticket"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="flex min-w-0 flex-col">
                    <div class="truncate font-bold text-slate-900">{{ t.title }}</div>
                    <div class="truncate text-xs text-slate-500">
                      {{ t.subtitle }} ・ID：{{ t.id }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="text-sm font-semibold text-slate-900">
                {{ store.brandLabelMap[t.brandId] || t.brandId }}
              </td>

              <td class="font-semibold text-slate-900">
                {{ t.points }}
              </td>

              <td class="text-xs text-slate-500">
                <div class="flex items-center gap-2">
                  <span>{{ t.validTo }}</span>
                  <span
                    v-if="store.validStateOf(t) === 'expired'"
                    class="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-extrabold text-rose-700"
                  >
                    已過期
                  </span>
                  <span
                    v-else-if="store.validStateOf(t) === 'soon'"
                    class="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-extrabold text-amber-700"
                  >
                    即將到期
                  </span>
                </div>
              </td>

              <td class="font-semibold text-slate-900">
                {{ t.stock === -1 ? "不限量" : t.stock }}
              </td>

              <td class="font-semibold text-slate-900">
                {{ formatCompact(t.redeemedCount) }}
              </td>

              <td>
                <span
                  class="rounded-full px-2 py-1 text-xs font-extrabold"
                  :class="statusClass(t)"
                >
                  {{ statusText(t) }}
                </span>
              </td>

              <td class="text-xs text-slate-500">{{ t.updatedAt }}</td>

              <td @click.stop>
                <button
                  type="button"
                  class="btn btn-sm btn-ghost flex h-8 w-8 items-center justify-center"
                  @click="openRowMenu($event, t.id)"
                  title="操作"
                >
                  <EllipsisHorizontalIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>

            <tr v-if="!store.pageItems.length">
              <td colspan="10" class="py-10 text-center text-sm text-slate-500">
                沒有符合條件的票券
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
import { reactive, watchEffect } from "vue";
import { useRouter } from "vue-router";
import AppPagination from "@/components/common/AppPagination.vue";
import { useAdminTicketStore } from "@/stores/adminTicketStore";
import { PlusIcon, EllipsisHorizontalIcon } from "@heroicons/vue/24/outline";
import type { AdminTicket } from "@/stores/adminTicketStore";

const router = useRouter();
const store = useAdminTicketStore();

const draft = reactive({
  keyword: store.filters.keyword,
  status: store.filters.status,
  brandId: store.filters.brandId,
  validState: store.filters.validState,
  pointsMin: store.filters.pointsMin,
  pointsMax: store.filters.pointsMax,
});

watchEffect(() => {
  void store.pageItems;
});

function applyFilters() {
  store.setFilters({
    keyword: draft.keyword,
    status: draft.status,
    brandId: draft.brandId,
    validState: draft.validState,
    pointsMin: draft.pointsMin,
    pointsMax: draft.pointsMax,
  });
  store.applyFilters();
}

function resetFilters() {
  store.resetFilters();
  draft.keyword = store.filters.keyword;
  draft.status = store.filters.status;
  draft.brandId = store.filters.brandId;
  draft.validState = store.filters.validState;
  draft.pointsMin = store.filters.pointsMin;
  draft.pointsMax = store.filters.pointsMax;
}

function goCreate() {
  router.push("/tickets/create");
}

function goEdit(id: string) {
  router.push(`/tickets/${id}/edit`);
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
  console.log("[票券列表] row menu", id);
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

function formatCompact(n: number) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function statusText(t: AdminTicket) {
  if (store.validStateOf(t) === "expired") return "過期";
  if (t.status === "draft") return "草稿";
  if (t.status === "enabled") return "上架";
  return "下架";
}

function statusClass(t: AdminTicket) {
  if (store.validStateOf(t) === "expired") return "bg-rose-50 text-rose-700";
  if (t.status === "draft") return "bg-amber-50 text-amber-700";
  if (t.status === "enabled") return "bg-green-50 text-green-700";
  return "bg-slate-100 text-slate-600";
}
</script>
