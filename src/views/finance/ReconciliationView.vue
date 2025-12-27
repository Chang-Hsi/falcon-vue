<!-- src/views/ReconcileReportView.vue -->
<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-start justify-between gap-3">
      <div class="flex flex-col">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          對帳報表
        </div>
        <div class="mt-1 text-sm text-slate-500">選擇條件後匯出 CSV / Excel（.xls）</div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          @click="exportCsv()"
        >
          匯出 CSV
        </button>
        <button
          type="button"
          class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          @click="exportXls()"
        >
          匯出 Excel（.xls）
        </button>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
    >
      <div class="flex w-full flex-wrap items-end gap-3">
        <div class="flex min-w-55 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">日期區間</div>
          <div class="flex w-full items-center gap-2">
            <input
              v-model="draft.dateFrom"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
            <div class="text-sm text-slate-400">~</div>
            <input
              v-model="draft.dateTo"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">品牌</div>
          <select
            v-model="draft.brandId"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option v-for="b in store.brands" :key="b.id" :value="b.id">
              {{ b.label }}
            </option>
          </select>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">付款方式</div>
          <select
            v-model="draft.paymentMethod"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option v-for="p in store.payments" :key="p.id" :value="p.id">
              {{ p.label }}
            </option>
          </select>
        </div>

        <div class="flex min-w-40 flex-1 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">對帳狀態</div>
          <select
            v-model="draft.status"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="">全部</option>
            <option value="pending">待入帳</option>
            <option value="settled">已入帳</option>
            <option value="refunded">已退款</option>
            <option value="void">已作廢</option>
            <option value="failed">失敗/異常</option>
          </select>
        </div>

        <div class="flex max-w-55 flex-2 flex-col gap-1">
          <div class="text-xs font-semibold text-slate-500">關鍵字</div>
          <input
            v-model="draft.keyword"
            type="text"
            placeholder="訂單號 / 交易序號 / 記錄ID"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            @click="apply()"
          >
            套用
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            @click="reset()"
          >
            重設
          </button>
        </div>
      </div>

      <div class="flex w-full flex-wrap items-stretch gap-3">
        <div
          class="flex min-w-50 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-700">筆數</div>
          <div class="text-2xl font-extrabold text-slate-900">
            {{ summary.count }}
          </div>
          <div class="text-xs text-slate-500">目前條件下的交易記錄</div>
        </div>

        <div
          class="flex min-w-50 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-700">交易總金額</div>
          <div class="text-2xl font-extrabold text-slate-900">
            {{ money(summary.amountTotal) }}
          </div>
          <div class="text-xs text-slate-500">匯出時會依目前條件整批輸出</div>
        </div>

        <div
          class="flex min-w-50 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-700">手續費總額</div>
          <div class="text-2xl font-extrabold text-slate-900">
            {{ money(summary.feeTotal) }}
          </div>
          <div class="text-xs text-slate-500">模擬資料計算</div>
        </div>

        <div
          class="flex min-w-50 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-700">淨入帳總額</div>
          <div class="text-2xl font-extrabold text-slate-900">
            {{ money(summary.netTotal) }}
          </div>
          <div class="text-xs text-slate-500">交易金額 - 手續費</div>
        </div>

        <div
          class="flex min-w-50 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <div class="text-sm font-semibold text-slate-700">退款</div>
          <div class="text-2xl font-extrabold text-slate-900">
            {{ summary.refundedCount }} 筆
          </div>
          <div class="text-xs text-slate-500">
            金額：{{ money(summary.refundedTotal) }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
    >
      <div
        class="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3"
      >
        <div class="flex items-center gap-2">
          <div class="text-sm font-semibold text-slate-900">報表列表</div>
          <div class="text-xs text-slate-500">共 {{ total }} 筆</div>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model.number="pageSizeModel"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option :value="10">10 / 頁</option>
            <option :value="20">20 / 頁</option>
            <option :value="50">50 / 頁</option>
          </select>
        </div>
      </div>

      <div class="w-full overflow-auto">
        <table class="w-full min-w-275 table-fixed">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold text-slate-600">
              <th class="w-30] px-4 py-3">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('date')"
                >
                  日期
                </button>
              </th>
              <th class="w-42.5 px-4 py-3">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('orderNo')"
                >
                  訂單號
                </button>
              </th>
              <th class="w-42.5 px-4 py-3">交易序號</th>
              <th class="w-35 px-4 py-3">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('brand')"
                >
                  品牌
                </button>
              </th>
              <th class="w-35 px-4 py-3">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('payment')"
                >
                  付款方式
                </button>
              </th>
              <th class="w-30] px-4 py-3 text-right">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('amount')"
                >
                  金額
                </button>
              </th>
              <th class="w-27.5 px-4 py-3 text-right">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('fee')"
                >
                  手續費
                </button>
              </th>
              <th class="w-30 px-4 py-3 text-right">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('net')"
                >
                  淨額
                </button>
              </th>
              <th class="w-32.5 px-4 py-3">
                <button
                  type="button"
                  class="hover:text-slate-900"
                  @click="toggleSort('status')"
                >
                  狀態
                </button>
              </th>
              <th class="w-42.5 px-4 py-3">入帳時間</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in pageItems"
              :key="row.id"
              class="text-sm text-slate-700 hover:bg-slate-50"
            >
              <td class="px-4 py-3 text-slate-900">
                {{ row.date }}
              </td>
              <td class="px-4 py-3 font-semibold text-slate-900">
                {{ row.orderNo }}
              </td>
              <td class="px-4 py-3">
                <div class="truncate" :title="row.txNo">{{ row.txNo }}</div>
              </td>
              <td class="px-4 py-3">
                {{ brandLabel(row.brandId) }}
              </td>
              <td class="px-4 py-3">
                {{ paymentLabel(row.paymentMethod) }}
              </td>
              <td class="px-4 py-3 text-right font-semibold text-slate-900">
                {{ money(row.amount) }}
              </td>
              <td class="px-4 py-3 text-right">
                {{ money(row.fee) }}
              </td>
              <td class="px-4 py-3 text-right font-semibold text-slate-900">
                {{ money(row.net) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                  :class="statusPillClass(row.status)"
                >
                  {{ statusText(row.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ row.settledAt || "—" }}
              </td>
            </tr>

            <tr v-if="pageItems.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-500" colspan="10">
                沒有符合條件的資料
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination :page="page" :page-count="pageCount" @change="setPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import AppPagination from "@/components/common/AppPagination.vue";
import { useAdminReconcileStore, type ReconcileStatus, type SortKey, type PaymentMethodId } from "@/stores/adminReconcileStore";

const store = useAdminReconcileStore();

type DraftFilters = {
  dateFrom: string;
  dateTo: string;
  brandId: string;
  paymentMethod: "" | PaymentMethodId;
  status: "" | ReconcileStatus;
  keyword: string;
};

const draft = reactive<DraftFilters>({
  dateFrom: store.filters.dateFrom,
  dateTo: store.filters.dateTo,
  brandId: store.filters.brandId,
  paymentMethod: store.filters.paymentMethod,
  status: store.filters.status,
  keyword: store.filters.keyword,
});

watch(
  () => store.filters,
  (next) => {
    draft.dateFrom = next.dateFrom;
    draft.dateTo = next.dateTo;
    draft.brandId = next.brandId;
    draft.paymentMethod = next.paymentMethod;
    draft.status = next.status;
    draft.keyword = next.keyword;
  },
  { deep: true }
);

const page = computed(() => store.page);
const pageCount = computed(() => store.pageCount);
const total = computed(() => store.total);
const pageItems = computed(() => store.pageItems);
const summary = computed(() => store.summary);

const pageSizeModel = computed<number>({
  get() {
    return store.pageSize;
  },
  set(v) {
    store.setPageSize(Number(v) || 10);
  },
});

function apply() {
  store.setFilters({
    dateFrom: draft.dateFrom,
    dateTo: draft.dateTo,
    brandId: draft.brandId,
    paymentMethod: draft.paymentMethod,
    status: draft.status,
    keyword: draft.keyword,
  });
  store.applyFilters();
}

function reset() {
  store.resetFilters();
  store.applyFilters();
}

function setPage(p: number) {
  store.setPage(p);
}

function toggleSort(key: SortKey) {
  store.toggleSort(key);
}

function exportCsv() {
  store.exportCsv("filtered");
}

function exportXls() {
  store.exportXls("filtered");
}

function money(n: number) {
  const v = Number(n) || 0;
  return v.toLocaleString("zh-Hant-TW");
}

function brandLabel(id: string) {
  return store.brandLabelMap[id] || id;
}

function paymentLabel(id: PaymentMethodId) {
  return store.paymentLabelMap[id] || id;
}

function statusText(s: ReconcileStatus) {
  if (s === "pending") return "待入帳";
  if (s === "settled") return "已入帳";
  if (s === "refunded") return "已退款";
  if (s === "void") return "已作廢";
  return "失敗/異常";
}

function statusPillClass(s: ReconcileStatus) {
  if (s === "settled") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (s === "refunded") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (s === "void") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}
</script>
