<!-- src/views/dashboard/DashboardView.vue -->
<template>
  <div class="flex w-full flex-col gap-4 p-4 lg:px-6">
    <div class="flex w-full flex-col gap-1">
      <div class="text-xl font-extrabold tracking-wide text-slate-900 lg:text-2xl">
        下午好，Musharof！
      </div>
      <div class="text-sm text-slate-500">以下是你今天商店的最新狀況</div>
    </div>

    <div class="flex w-full flex-col gap-4 lg:flex-row">
      <div class="flex w-full flex-col gap-4 lg:w-105 lg:flex-none">
        <div
          class="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex w-full flex-col gap-3">
            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-500">今日訪客</div>
              <div class="text-2xl font-extrabold text-slate-900">
                {{ fmtInt(todaySummary.visitsToday) }}
              </div>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-bold text-slate-500">今日總銷售額</div>
              <div class="text-2xl font-extrabold text-slate-900">
                {{ fmtMoney(todaySummary.salesToday) }}
              </div>
            </div>
          </div>

          <div
            class="flex w-full flex-col overflow-hidden rounded-xl border border-slate-100"
          >
            <div
              v-for="a in alerts"
              :key="a.key"
              class="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span class="h-2 w-2 rounded-full" :class="alertDotClass(a.level)"></span>
                <div class="min-w-0 truncate text-sm font-semibold text-slate-700">
                  {{ a.text }}
                </div>
              </div>
              <div class="text-sm font-bold text-slate-500">{{ a.value }}</div>
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="flex w-full flex-wrap">
            <div
              v-for="k in kpiTiles"
              :key="k.key"
              class="flex w-1/2 flex-col gap-1 border-b border-r border-slate-100 p-4 last:border-r-0 lg:w-1/3"
              :class="k.borderFix"
            >
              <div class="text-xs font-bold text-slate-500">{{ k.label }}</div>
              <div class="text-xl font-extrabold text-slate-900">{{ k.value }}</div>
              <div class="flex items-center gap-2 text-xs">
                <div class="font-semibold text-slate-400">{{ k.subValue }}</div>
                <div
                  class="flex items-center gap-1 font-extrabold"
                  :class="deltaClass(k.deltaPct)"
                >
                  <span>{{ k.deltaPct > 0 ? "▲" : k.deltaPct < 0 ? "▼" : "•" }}</span>
                  <span>{{ fmtPct(k.deltaPct) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col gap-4">
          <div class="flex w-full flex-col gap-4 sm:flex-row">
            <div
              class="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex w-full items-center justify-between">
                <div class="text-sm font-extrabold text-slate-800">每週銷售</div>
                <div
                  class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700"
                >
                  {{ fmtPct(weeklySales.deltaPct) }}
                </div>
              </div>
              <div class="flex w-full items-end justify-between gap-4">
                <div class="text-2xl font-extrabold text-slate-900">
                  {{ weeklySales.totalLabel }}
                </div>
                <div class="flex min-h-0 flex-1">
                  <VChart class="h-16 w-full" :option="weeklyBarOption" autoresize />
                </div>
              </div>
            </div>

            <div
              class="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex w-full items-center justify-between">
                <div class="text-sm font-extrabold text-slate-800">商品占比</div>
                <div
                  class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700"
                >
                  {{ fmtPct(productShare.deltaPct) }}
                </div>
              </div>
              <div class="flex w-full items-center justify-between gap-3">
                <div class="flex min-w-0 flex-col">
                  <div class="text-2xl font-extrabold text-slate-900">
                    {{ fmtPct(productShare.valuePct) }}
                  </div>
                  <div class="mt-1 text-xs font-semibold text-slate-500">
                    目標：{{ fmtPct(productShare.targetPct) }}
                  </div>
                </div>
                <div class="flex h-20 w-35 flex-none">
                  <VChart
                    class="h-full w-full"
                    :option="productShareGaugeOption"
                    autoresize
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex w-full flex-col gap-4 sm:flex-row">
            <div
              class="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex w-full items-center justify-between">
                <div class="text-sm font-extrabold text-slate-800">市占率</div>
                <div class="text-xs font-semibold text-slate-500">熱門品牌</div>
              </div>

              <div class="flex w-full items-center gap-4">
                <div class="flex h-21.5 w-21.5 flex-none">
                  <VChart
                    class="h-full w-full"
                    :option="marketShareDonutOption"
                    autoresize
                  />
                </div>

                <div class="flex min-w-0 flex-1 flex-col gap-2">
                  <div
                    v-for="b in marketShareBrands"
                    :key="b.name"
                    class="flex w-full items-center justify-between gap-3"
                  >
                    <div class="flex min-w-0 items-center gap-2">
                      <span
                        class="h-2 w-2 rounded-full"
                        :style="{ background: b.color }"
                      ></span>
                      <div class="min-w-0 truncate text-xs font-bold text-slate-600">
                        {{ b.name }}
                      </div>
                    </div>
                    <div class="text-xs font-extrabold text-slate-700">
                      {{ fmtPct(b.pct) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex w-full items-center justify-between">
                <div class="text-sm font-extrabold text-slate-800">總訂單</div>
                <div
                  class="rounded-lg bg-blue-50 px-2 py-1 text-xs font-extrabold text-blue-700"
                >
                  {{ fmtPct(totalOrder.deltaPct) }}
                </div>
              </div>

              <div class="flex w-full items-end justify-between gap-4">
                <div class="text-2xl font-extrabold text-slate-900">
                  {{ totalOrder.totalLabel }}
                </div>
                <div class="flex min-h-0 flex-1">
                  <VChart
                    class="h-16 w-full"
                    :option="totalOrderSparkOption"
                    autoresize
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-sm font-extrabold text-slate-800">購物車</div>

          <div class="flex w-full flex-col gap-3">
            <div v-for="m in cartMetrics" :key="m.key" class="flex w-full flex-col gap-2">
              <div class="flex w-full items-center justify-between gap-3">
                <div class="text-xs font-bold text-slate-500">{{ m.label }}</div>
                <div class="flex items-center gap-2 text-xs">
                  <div class="font-extrabold" :class="metricDeltaClass(m.deltaPct)">
                    <span>{{ m.deltaPct > 0 ? "▲" : m.deltaPct < 0 ? "▼" : "•" }}</span>
                    <span>{{ fmtPct(Math.abs(m.deltaPct)) }}</span>
                  </div>
                  <div class="font-semibold text-slate-400">{{ m.note }}</div>
                </div>
              </div>

              <div class="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full"
                  :style="{ width: m.barPct + '%', background: m.barColor }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-1 flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 flex-col gap-1">
              <div class="text-sm font-extrabold text-slate-800">總銷售額</div>
              <div class="text-xs text-slate-500">對比上一期與去年同期</div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                @click="activeSalesView = 'revenue'"
              >
                營收
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                @click="activeSalesView = 'orders'"
              >
                訂單
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                @click="activeSalesView = 'tickets'"
              >
                票券
              </button>
            </div>
          </div>

          <div class="flex w-full flex-wrap items-center gap-3 text-xs">
            <div class="flex items-center gap-2 font-semibold text-slate-500">
              <span
                class="h-2 w-2 rounded-full"
                :style="{ background: mainSeriesColor }"
              ></span>
              <span>{{ compareLabels.primary }}</span>
              <span class="font-extrabold text-slate-700">{{
                compareLabels.primaryValue
              }}</span>
            </div>

            <div class="flex items-center gap-2 font-semibold text-slate-500">
              <span
                class="h-2 w-2 rounded-full"
                :style="{ background: compareSeriesColor }"
              ></span>
              <span>{{ compareLabels.secondary }}</span>
              <span class="font-extrabold text-slate-700">{{
                compareLabels.secondaryValue
              }}</span>
            </div>
          </div>

          <div class="mt-2 flex min-h-0 flex-1">
            <VChart class="h-90 w-full" :option="totalSalesOption" autoresize />
          </div>
        </div>

        <div class="flex w-full flex-col gap-4 lg:flex-row">
          <div
            class="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex w-full items-center justify-between">
              <div class="text-sm font-extrabold text-slate-800">流量來源占比</div>
              <div class="text-xs font-semibold text-slate-500">本月</div>
            </div>

            <div class="flex w-full items-center gap-4">
              <div class="flex h-42.5 w-42.5 flex-none">
                <VChart class="h-full w-full" :option="channelDonutOption" autoresize />
              </div>

              <div class="flex min-w-0 flex-1 flex-col gap-2">
                <div
                  v-for="c in channels"
                  :key="c.name"
                  class="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      class="h-2 w-2 rounded-full"
                      :style="{ background: c.color }"
                    ></span>
                    <div class="min-w-0 truncate text-xs font-extrabold text-slate-700">
                      {{ c.name }}
                    </div>
                  </div>
                  <div class="text-xs font-extrabold text-slate-700">
                    {{ fmtPct(c.valuePct) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex w-full items-center justify-between">
              <div class="text-sm font-extrabold text-slate-800">轉換漏斗</div>
              <div class="text-xs font-semibold text-slate-500">近 14 天</div>
            </div>

            <div class="flex w-full flex-col gap-3">
              <div
                v-for="s in funnelStages"
                :key="s.key"
                class="flex w-full flex-col gap-2"
              >
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-xs font-bold text-slate-500">{{ s.label }}</div>
                  <div class="text-xs font-extrabold text-slate-700">
                    {{ fmtInt(s.count) }}
                    <span class="ml-2 font-semibold text-slate-400">{{
                      fmtPct(s.ratePct)
                    }}</span>
                  </div>
                </div>
                <div class="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: s.barPct + '%', background: s.color }"
                  ></div>
                </div>
              </div>

              <div class="mt-1 flex w-full flex-wrap gap-2">
                <div
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700"
                >
                  整體轉換率：<span class="ml-1">{{
                    fmtPct(funnelSummary.overallConversionPct)
                  }}</span>
                </div>
                <div
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700"
                >
                  退款率：<span class="ml-1">{{
                    fmtPct(funnelSummary.refundRatePct)
                  }}</span>
                </div>
                <div
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700"
                >
                  平均客單價：<span class="ml-1">{{
                    fmtMoney(funnelSummary.avgOrderValue)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex w-full items-center justify-between">
            <div class="text-sm font-extrabold text-slate-800">近期購買</div>
            <div class="text-xs font-semibold text-slate-500">
              最新 {{ recentPurchases.length }} 筆訂單
            </div>
          </div>

          <div
            class="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200"
          >
            <div
              class="flex w-full items-center gap-3 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-500"
            >
              <div class="w-35 flex-none">客戶</div>
              <div class="w-55 flex-none">Email</div>
              <div class="min-w-0 flex-1">商品</div>
              <div class="w-30 flex-none text-center">付款狀態</div>
              <div class="w-27.5 flex-none text-right">金額</div>
            </div>

            <div class="flex w-full flex-col divide-y divide-slate-100 bg-white">
              <div
                v-for="r in recentPurchases"
                :key="r.id"
                class="flex w-full items-center gap-3 px-3 py-3 text-sm"
              >
                <div class="w-35 flex-none truncate font-extrabold text-slate-900">
                  {{ r.customer }}
                </div>
                <div class="w-55 flex-none truncate text-xs font-semibold text-slate-500">
                  {{ r.email }}
                </div>
                <div class="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">
                  {{ r.product }}
                </div>
                <div class="w-30 flex-none text-center">
                  <span
                    class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold"
                    :class="paymentChipClass(r.payment)"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="paymentDotClass(r.payment)"
                    ></span>
                    <span>{{ r.payment }}</span>
                  </span>
                </div>
                <div
                  class="w-27.5 flex-none text-right text-sm font-extrabold text-slate-900"
                >
                  {{ fmtMoney(r.amount) }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex w-full items-center justify-between text-xs font-semibold text-slate-500"
          >
            <div>
              顯示第 1 筆到第 {{ recentPurchases.length }} 筆，共
              {{ fmtInt(recentTotal) }} 筆
            </div>
            <div class="flex items-center gap-2">
              <div
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700"
              >
                上一頁
              </div>
              <div
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white"
              >
                下一頁
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="h-2"></div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import VChart from "vue-echarts";

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart, PieChart, GaugeChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
} from "echarts/components";

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
]);

const todaySummary = {
  visitsToday: 14209,
  salesToday: 21349.29,
};

const alerts = [
  {
    key: "a1",
    level: "warning",
    text: "有 5 個商品未成功發佈到你的 Facebook 粉專",
    value: "5",
  },
  {
    key: "a2",
    level: "info",
    text: "有 7 筆訂單的付款尚待請款",
    value: "7",
  },
  { key: "a3", level: "info", text: "50+ 筆訂單待出貨", value: "50+" },
];

const kpiTiles = [
  {
    key: "orders",
    label: "訂單數",
    value: "15,450",
    subValue: "13,675",
    deltaPct: 2.18,
    borderFix: "",
  },
  {
    key: "items",
    label: "售出件數",
    value: "1,054",
    subValue: "13,675",
    deltaPct: -2.18,
    borderFix: "",
  },
  {
    key: "refunds",
    label: "退款",
    value: "$145.65",
    subValue: "13,675",
    deltaPct: 2.18,
    borderFix: "border-r-0 lg:border-r-0",
  },
  {
    key: "gross",
    label: "毛銷售額",
    value: "$100.26",
    subValue: "$109.65",
    deltaPct: -2.18,
    borderFix: "border-b-0 lg:border-b-0",
  },
  {
    key: "shipping",
    label: "運費",
    value: "$365.53",
    subValue: "13,675",
    deltaPct: 2.18,
    borderFix: "border-b-0 lg:border-b-0",
  },
  {
    key: "processing",
    label: "處理中",
    value: "861",
    subValue: "13,675",
    deltaPct: 2.18,
    borderFix: "border-b-0 border-r-0 lg:border-b-0 lg:border-r-0",
  },
];

const weeklySales = {
  totalLabel: "$47K",
  deltaPct: 3.5,
  bars: [9, 12, 8, 10, 14, 11, 13],
};

const productShare = {
  valuePct: 34.6,
  targetPct: 55,
  deltaPct: 3.5,
};

const marketShareBrandRaw = [
  { name: "獵鷹", value: 46_000, color: "#2563eb" },
  { name: "麻雀", value: 32_000, color: "#06b6d4" },
  { name: "鳳凰", value: 22_000, color: "#f97316" },
];

const marketShareTotal = computed(() => {
  return marketShareBrandRaw.reduce((sum, b) => sum + (Number(b.value) || 0), 0);
});

const marketShareBrands = computed(() => {
  const total = marketShareTotal.value || 1;
  return marketShareBrandRaw.map((b) => {
    const pct = (b.value / total) * 100;
    return { name: b.name, value: b.value, pct, color: b.color };
  });
});

const marketShareCenterText = computed(() => fmtCompact(marketShareTotal.value));

const totalOrder = {
  totalLabel: "58.4K",
  deltaPct: 13.6,
  spark: [6, 7, 7, 8, 10, 12, 11, 13, 16, 15, 14, 12],
};

const cartMetrics = [
  {
    key: "initiated",
    label: "已加入購物車",
    deltaPct: 43.6,
    note: "Session：6817",
    barPct: 58,
    barColor: "#2563eb",
  },
  {
    key: "abandon",
    label: "放棄率",
    deltaPct: -13.11,
    note: "44 / 61",
    barPct: 26,
    barColor: "#ef4444",
  },
  {
    key: "bounce",
    label: "跳出率",
    deltaPct: 12.11,
    note: "8 / 61",
    barPct: 38,
    barColor: "#06b6d4",
  },
  {
    key: "complete",
    label: "完成率",
    deltaPct: -43.6,
    note: "18 / 179",
    barPct: 44,
    barColor: "#f97316",
  },
  {
    key: "revenue",
    label: "營收率",
    deltaPct: 60.5,
    note: "18 / 179",
    barPct: 62,
    barColor: "#22c55e",
  },
];

const channelRaw = [
  { name: "直接", value: 9_880_000, color: "#2563eb" },
  { name: "自然", value: 7_020_000, color: "#06b6d4" },
  { name: "廣告", value: 5_460_000, color: "#f97316" },
  { name: "社群", value: 3_640_000, color: "#a855f7" },
];

const channelTotal = computed(() => {
  return channelRaw.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
});

const channels = computed(() => {
  const total = channelTotal.value || 1;
  return channelRaw.map((c) => {
    const valuePct = (c.value / total) * 100;
    return { name: c.name, value: c.value, valuePct, color: c.color };
  });
});

const funnelRaw = {
  visits: 148200,
  search: 67300,
  detailView: 39240,
  checkout: 10680,
  paid: 7420,
  refunds: 96,
  revenue: 1268900,
};

const funnelStages = computed(() => {
  const base = funnelRaw.visits;
  const stages = [
    { key: "visits", label: "訪問", count: funnelRaw.visits, color: "#2563eb" },
    { key: "search", label: "搜尋", count: funnelRaw.search, color: "#06b6d4" },
    { key: "detail", label: "商品詳情", count: funnelRaw.detailView, color: "#f97316" },
    { key: "checkout", label: "結帳", count: funnelRaw.checkout, color: "#a855f7" },
    { key: "paid", label: "已付款", count: funnelRaw.paid, color: "#22c55e" },
  ];

  return stages.map((s) => {
    const ratePct = base === 0 ? 0 : (s.count / base) * 100;
    const barPct = Math.max(2, Math.min(100, ratePct));
    return { ...s, ratePct, barPct };
  });
});

const funnelSummary = computed(() => {
  const overallConversionPct =
    funnelRaw.visits === 0 ? 0 : (funnelRaw.paid / funnelRaw.visits) * 100;
  const refundRatePct =
    funnelRaw.paid === 0 ? 0 : (funnelRaw.refunds / funnelRaw.paid) * 100;
  const avgOrderValue = funnelRaw.paid === 0 ? 0 : funnelRaw.revenue / funnelRaw.paid;
  return { overallConversionPct, refundRatePct, avgOrderValue };
});

const recentTotal = 14;

const recentPurchases = [
  {
    id: "1",
    customer: "Sylvia Plath",
    email: "john@gmail.com",
    product: "票券 - 拖拉式 Bootstrap 產生器",
    payment: "成功",
    amount: 99,
  },
  {
    id: "2",
    customer: "Homer",
    email: "sylvia@mail.ru",
    product: "優惠 - Bose SoundSport 無線耳機",
    payment: "成功",
    amount: 634,
  },
  {
    id: "3",
    customer: "Edgar Allan Poe",
    email: "edgar@yahoo.com",
    product: "票券 - Fire HD 8 兒童版平板",
    payment: "已阻擋",
    amount: 199,
  },
  {
    id: "4",
    customer: "William Butler Yeats",
    email: "william@gmail.com",
    product: "票券 - Apple iPhone XR（64GB）",
    payment: "成功",
    amount: 798,
  },
  {
    id: "5",
    customer: "Rabindranath Tagore",
    email: "tagore@twitter.com",
    product: "票券 - ASUS Chromebook 11.6 吋",
    payment: "已阻擋",
    amount: 318,
  },
  {
    id: "6",
    customer: "Emily Dickinson",
    email: "emily@gmail.com",
    product: "優惠 - OK to Wake! 鬧鐘",
    payment: "待處理",
    amount: 11,
  },
  {
    id: "7",
    customer: "Giovanni Boccaccio",
    email: "giovanni@outlook.com",
    product: "優惠 - Summer Infant 尿布墊",
    payment: "成功",
    amount: 31,
  },
];

const activeSalesView = ref("revenue");

const dates14 = [
  "12/13",
  "12/14",
  "12/15",
  "12/16",
  "12/17",
  "12/18",
  "12/19",
  "12/20",
  "12/21",
  "12/22",
  "12/23",
  "12/24",
  "12/25",
  "12/26",
];

const revenuePrimary = [42, 78, 60, 84, 72, 88, 74, 92, 130, 90, 32, 40, 30, 66];
const revenueSecondary = [112, 30, 40, 52, 60, 70, 76, 55, 42, 35, 110, 92, 70, 58];

const ordersPrimary = [
  120,
  210,
  180,
  240,
  200,
  260,
  220,
  278,
  310,
  230,
  100,
  118,
  94,
  170,
];
const ordersSecondary = [
  260,
  90,
  112,
  136,
  150,
  170,
  186,
  142,
  120,
  108,
  240,
  210,
  188,
  160,
];

const ticketsPrimary = [
  260,
  420,
  380,
  520,
  460,
  610,
  540,
  700,
  860,
  620,
  260,
  310,
  280,
  460,
];
const ticketsSecondary = [
  780,
  260,
  300,
  340,
  380,
  420,
  450,
  390,
  350,
  330,
  720,
  640,
  560,
  510,
];

const mainSeriesColor = "#2563eb";
const compareSeriesColor = "#fb923c";

const compareLabels = computed(() => {
  if (activeSalesView.value === "revenue") {
    return {
      primary: "上個月：",
      primaryValue: "$32,502.00",
      secondary: "去年同期：",
      secondaryValue: "$46,018.00",
    };
  }
  if (activeSalesView.value === "orders") {
    return {
      primary: "上個月：",
      primaryValue: "3,492",
      secondary: "去年同期：",
      secondaryValue: "4,106",
    };
  }
  return {
    primary: "上個月：",
    primaryValue: "9,842",
    secondary: "去年同期：",
    secondaryValue: "12,708",
  };
});

const totalSalesOption = computed(() => {
  const mode = activeSalesView.value;

  const p =
    mode === "revenue"
      ? revenuePrimary
      : mode === "orders"
      ? ordersPrimary
      : ticketsPrimary;
  const s =
    mode === "revenue"
      ? revenueSecondary
      : mode === "orders"
      ? ordersSecondary
      : ticketsSecondary;

  return {
    animation: true,
    animationDuration: 900,
    tooltip: { trigger: "axis" },
    grid: { left: 26, right: 16, top: 24, bottom: 24, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates14,
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#94a3b8", fontWeight: 700 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
      axisLabel: { color: "#94a3b8", fontWeight: 700 },
    },
    series: [
      {
        name: "主要",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3, color: mainSeriesColor },
        itemStyle: { color: mainSeriesColor },
        areaStyle: { opacity: 0.1, color: mainSeriesColor },
        data: p,
      },
      {
        name: "對比",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2, color: compareSeriesColor },
        itemStyle: { color: compareSeriesColor },
        data: s,
      },
    ],
  };
});

const weeklyBarOption = computed(() => {
  return {
    animation: true,
    animationDuration: 700,
    grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: false },
    xAxis: {
      type: "category",
      show: false,
      data: ["一", "二", "三", "四", "五", "六", "日"],
    },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "bar",
        data: weeklySales.bars,
        barWidth: 6,
        itemStyle: { color: "#2563eb", borderRadius: [8, 8, 8, 8] },
      },
    ],
  };
});

const productShareGaugeOption = computed(() => {
  return {
    animation: true,
    animationDuration: 800,
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "70%"],
        radius: "110%",
        min: 0,
        max: 100,
        splitNumber: 1,
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [productShare.valuePct / 100, "#2563eb"],
              [1, "#e2e8f0"],
            ],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: productShare.valuePct }],
      },
    ],
  };
});

const marketShareDonutOption = computed(() => {
  const data = marketShareBrands.value.map((b) => ({
    name: b.name,
    value: b.value,
    itemStyle: { color: b.color },
  }));

  return {
    animation: true,
    animationDuration: 800,
    tooltip: { trigger: "item" },
    title: {
      text: marketShareCenterText.value,
      left: "center",
      top: "center",
      textStyle: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
    },
    series: [
      {
        type: "pie",
        radius: ["68%", "86%"],
        center: ["50%", "50%"],
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  };
});

const totalOrderSparkOption = computed(() => {
  return {
    animation: true,
    animationDuration: 700,
    grid: { left: 0, right: 0, top: 6, bottom: 0, containLabel: false },
    xAxis: {
      type: "category",
      show: false,
      data: totalOrder.spark.map((_, i) => String(i + 1)),
    },
    yAxis: { type: "value", show: false },
    series: [
      {
        type: "line",
        data: totalOrder.spark,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 3, color: "#2563eb" },
        areaStyle: { opacity: 0.1, color: "#2563eb" },
      },
    ],
  };
});

const channelShareTotal = 26000000;
const channelCenterText = computed(() => fmtCompact(channelShareTotal));

const channelDonutOption = computed(() => {
  return {
    animation: true,
    animationDuration: 800,
    tooltip: { trigger: "item" },
    legend: { show: false },
    title: {
      text: channelCenterText.value,
      left: "center",
      top: "center",
      textStyle: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "78%"],
        center: ["50%", "50%"],
        label: { show: false },
        labelLine: { show: false },
        data: channels.value.map((c) => ({
          name: c.name,
          value: c.value,
          itemStyle: { color: c.color },
        })),
      },
    ],
  };
});

function fmtInt(n) {
  try {
    return new Intl.NumberFormat("en-US").format(n);
  } catch {
    return String(n);
  }
}

function fmtMoney(n) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      n
    );
  } catch {
    return `$${n}`;
  }
}

function fmtCompact(n) {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${Math.round((n / 1_000_000_000) * 10) / 10}B`;
  if (abs >= 1_000_000) return `${Math.round((n / 1_000_000) * 10) / 10}M`;
  if (abs >= 1_000) return `${Math.round((n / 1_000) * 10) / 10}K`;
  return String(Math.round(n));
}

function fmtPct(n) {
  const v = Math.round(n * 100) / 100;
  return `${v}%`;
}

function deltaClass(p) {
  if (p > 0) return "text-emerald-700";
  if (p < 0) return "text-rose-700";
  return "text-slate-600";
}

function metricDeltaClass(p) {
  if (p > 0) return "text-emerald-700";
  if (p < 0) return "text-rose-700";
  return "text-slate-600";
}

function alertDotClass(level) {
  if (level === "danger") return "bg-rose-500";
  if (level === "warning") return "bg-amber-500";
  return "bg-blue-500";
}

function paymentChipClass(payment) {
  if (payment === "成功") return "bg-emerald-50 text-emerald-700";
  if (payment === "待處理") return "bg-amber-50 text-amber-700";
  if (payment === "已阻擋") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function paymentDotClass(payment) {
  if (payment === "成功") return "bg-emerald-500";
  if (payment === "待處理") return "bg-amber-500";
  if (payment === "已阻擋") return "bg-slate-500";
  return "bg-slate-400";
}
</script>
