<!-- src/views/AdminUserManagementView.vue -->
<template>
  <div class="flex w-full flex-col gap-4 bg-slate-50">
    <div class="flex w-full flex-col gap-1">
      <div class="text-[22px] font-extrabold tracking-wide text-slate-900 lg:text-[26px]">
        權限管理
      </div>
      <div class="text-sm text-slate-500">
        角色 × 模組 × 權限點，一次看全局（圖）也能精準編輯（表）。
      </div>
    </div>

    <div
      v-if="uiBanner.show"
      class="flex w-full items-start justify-between gap-3 rounded-xl p-4 shadow-sm ring-1"
      :class="
        uiBanner.type === 'success'
          ? 'bg-emerald-50 ring-emerald-200'
          : uiBanner.type === 'error'
          ? 'bg-rose-50 ring-rose-200'
          : 'bg-slate-50 ring-slate-200'
      "
    >
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="text-sm font-bold text-slate-900">{{ uiBanner.title }}</div>
        <div class="text-sm text-slate-600">{{ uiBanner.message }}</div>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        @click="uiBanner.show = false"
      >
        關閉
      </button>
    </div>

    <div class="flex w-full flex-col gap-4 lg:flex-row">
      <div
        class="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:w-95 lg:min-w-95"
      >
        <div class="flex w-full items-start justify-between gap-3">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-base font-bold text-slate-900">當前操作者</div>
            <div class="text-xs text-slate-500">此頁的變更通常需要管理者權限</div>
          </div>
          <div class="flex items-center gap-2">
            <img
              :src="authStore.userAvatarUrl"
              alt="avatar"
              class="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
            />
          </div>
        </div>

        <div class="flex w-full flex-col gap-1">
          <div class="text-sm font-semibold text-slate-900">{{ authStore.userName }}</div>
          <div class="text-xs text-slate-500">{{ authStore.userRoleTitle }}</div>
        </div>

        <div class="h-px w-full bg-slate-100"></div>

        <div class="flex w-full flex-col gap-3">
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold text-slate-600">快速篩選</div>
            <div class="flex w-full flex-col gap-2">
              <div class="flex w-full flex-col gap-1">
                <div class="text-xs font-semibold text-slate-600">
                  選擇角色（高亮欄位）
                </div>
                <select
                  v-model="selectedRoleId"
                  class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  <option v-for="r in authStore.roles" :key="r.id" :value="r.id">
                    {{ r.name }}
                  </option>
                </select>
              </div>

              <div class="flex w-full flex-col gap-1">
                <div class="text-xs font-semibold text-slate-600">
                  選擇模組（控制表格內容）
                </div>
                <select
                  v-model="selectedModuleKey"
                  class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  <option v-for="m in authStore.modules" :key="m.key" :value="m.key">
                    {{ m.name }}
                  </option>
                </select>
              </div>

              <div class="flex w-full flex-col gap-1">
                <div class="text-xs font-semibold text-slate-600">搜尋權限點</div>
                <input
                  v-model="permKeyword"
                  type="text"
                  placeholder="例如：匯出 / 審核 / edit"
                  class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          <div class="h-px w-full bg-slate-100"></div>

          <div class="flex w-full flex-col gap-3">
            <div class="text-xs font-semibold text-slate-600">概覽</div>

            <div class="flex w-full flex-col gap-2">
              <div
                class="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200"
              >
                <div class="flex flex-col">
                  <div class="text-xs text-slate-500">角色數</div>
                  <div class="text-lg font-extrabold text-slate-900">
                    {{ authStore.roles.length }}
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">roles</div>
              </div>

              <div
                class="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200"
              >
                <div class="flex flex-col">
                  <div class="text-xs text-slate-500">模組數</div>
                  <div class="text-lg font-extrabold text-slate-900">
                    {{ authStore.modules.length }}
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">modules</div>
              </div>

              <div
                class="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200"
              >
                <div class="flex flex-col">
                  <div class="text-xs text-slate-500">權限點總數</div>
                  <div class="text-lg font-extrabold text-slate-900">
                    {{ totalPermissions }}
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">perms</div>
              </div>

              <div
                class="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200"
              >
                <div class="flex flex-col">
                  <div class="text-xs text-slate-500">待儲存變更</div>
                  <div class="text-lg font-extrabold text-slate-900">
                    {{ changeCount }}
                  </div>
                </div>
                <div class="text-xs font-semibold text-slate-500">changes</div>
              </div>
            </div>

            <div class="h-px w-full bg-slate-100"></div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-1 flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div class="flex w-full flex-col gap-1">
            <div class="text-base font-bold text-slate-900">權限矩陣（Matrix）</div>
            <div class="text-xs text-slate-500">
              目前顯示：<span class="font-semibold text-slate-700">{{
                selectedModuleName
              }}</span>
              ・高亮角色：
              <span class="font-semibold text-slate-700">{{ selectedRoleName }}</span>
            </div>
          </div>

          <div class="flex w-full items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg border px-3 py-2 text-sm font-semibold transition"
                :class="
                  isShowOnlySelectedRole
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                "
                @click="isShowOnlySelectedRole = !isShowOnlySelectedRole"
              >
                {{
                  isShowOnlySelectedRole ? "只顯示選定角色：ON" : "只顯示選定角色：OFF"
                }}
              </button>

              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="selectAllInModuleForSelectedRole(true)"
              >
                選定角色全勾
              </button>

              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="selectAllInModuleForSelectedRole(false)"
              >
                選定角色全不勾
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="resetToSnapshot()"
              >
                還原
              </button>
              <button
                type="button"
                class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                @click="saveSnapshot()"
              >
                儲存
              </button>
            </div>
          </div>

          <div class="w-full overflow-hidden rounded-xl ring-1 ring-slate-200">
            <div class="w-full overflow-auto">
              <table class="w-full min-w-230 table-fixed">
                <thead>
                  <tr class="bg-slate-50 text-left text-sm text-slate-700">
                    <th class="w-70 border-b border-slate-200 px-3 py-3 font-bold">
                      權限點
                    </th>
                    <th
                      v-for="r in visibleRoles"
                      :key="r.id"
                      class="border-b border-slate-200 px-3 py-3 font-bold"
                      :class="r.id === selectedRoleId ? 'bg-indigo-50' : ''"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate">{{ r.name }}</span>
                        <button
                          type="button"
                          class="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          @click="toggleColumnAll(r.id)"
                        >
                          全切換
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="p in filteredModulePermissions"
                    :key="p.key"
                    class="text-sm text-slate-700"
                  >
                    <td class="border-b border-slate-100 px-3 py-3">
                      <div class="flex w-full flex-col gap-1">
                        <div class="font-semibold text-slate-900">{{ p.name }}</div>
                        <div class="text-xs text-slate-500">{{ p.key }}</div>
                      </div>
                    </td>

                    <td
                      v-for="r in visibleRoles"
                      :key="`${p.key}_${r.id}`"
                      class="border-b border-slate-100 px-3 py-3"
                      :class="r.id === selectedRoleId ? 'bg-indigo-50' : ''"
                    >
                      <div class="flex w-full items-center justify-start">
                        <label class="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-slate-300"
                            :checked="authStore.hasPermission(r.id, p.key)"
                            @change="onTogglePermission(r.id, p.key)"
                          />
                          <span class="text-xs text-slate-500">{{
                            authStore.hasPermission(r.id, p.key) ? "允許" : "禁止"
                          }}</span>
                        </label>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredModulePermissions.length === 0">
                    <td
                      class="px-3 py-8 text-sm text-slate-500"
                      :colspan="1 + visibleRoles.length"
                    >
                      找不到符合條件的權限點
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex w-full flex-col gap-2">
            <div class="flex w-full items-center justify-between">
              <div class="text-sm font-bold text-slate-900">變更佇列</div>
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                @click="clearChangesByReset()"
                :disabled="changeCount === 0"
              >
                清空變更
              </button>
            </div>

            <div class="w-full overflow-hidden rounded-xl ring-1 ring-slate-200">
              <div class="min-h-15 w-full overflow-auto">
                <div v-if="changeCount === 0" class="px-4 py-8 text-sm text-slate-500">
                  目前沒有待儲存的變更
                </div>

                <div v-else class="flex w-full flex-col">
                  <div
                    v-for="c in changes"
                    :key="c.key"
                    class="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-4 py-3"
                  >
                    <div class="flex min-w-0 flex-1 flex-col gap-1">
                      <div class="text-sm font-semibold text-slate-900">
                        {{ c.roleName }} ・{{ c.moduleName }}
                      </div>
                      <div class="text-xs text-slate-500">{{ c.permKey }}</div>
                      <div class="text-sm text-slate-700">
                        {{ c.permName }}：{{ c.before ? "允許" : "禁止" }} →
                        {{ c.after ? "允許" : "禁止" }}
                      </div>
                    </div>

                    <button
                      type="button"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      @click="revertOneChange(c)"
                    >
                      撤回
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex w-full flex-col gap-2 mt-4">
              <div class="flex w-full items-center justify-between gap-2">
                <div class="text-sm font-bold text-slate-900">角色 × 模組熱力圖</div>
                <div class="text-xs text-slate-500">點格子可帶動篩選</div>
              </div>
              <div class="w-full overflow-hidden rounded-xl ring-1 ring-slate-200">
                <div ref="heatmapEl" class="h-80 w-full bg-white"></div>
              </div>
              <div class="text-xs text-slate-500">
                值越高代表該角色在該模組擁有越多權限點（用於快速找出權限過大/過小的角色）。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import type { ECharts, EChartsOption } from "echarts";
import { useAuthStore } from "@/stores/authStore.ts";
import type {
  AuthPermission,
  AuthRole,
  AuthModule,
  GrantsMap,
} from "@/stores/authStore.ts";

type BannerType = "success" | "error" | "info";
type UiBanner = { show: boolean; type: BannerType; title: string; message: string };

type ChangeItem = {
  key: string;
  roleId: string;
  roleName: string;
  moduleKey: string;
  moduleName: string;
  permKey: string;
  permName: string;
  before: boolean;
  after: boolean;
};

const authStore = useAuthStore();

const selectedRoleId = ref<string>(authStore.roles?.[0]?.id || "");
const selectedModuleKey = ref<string>(authStore.modules?.[0]?.key || "");
const permKeyword = ref<string>("");
const isShowOnlySelectedRole = ref<boolean>(false);

const uiBanner = ref<UiBanner>({
  show: false,
  type: "info",
  title: "",
  message: "",
});

function showBanner(type: BannerType, title: string, message: string) {
  uiBanner.value = { show: true, type, title, message };
}

const totalPermissions = computed<number>(() => authStore.allPermissionKeys.length);

const selectedRoleName = computed<string>(() => {
  return authStore.roles.find((r) => r.id === selectedRoleId.value)?.name || "—";
});

const selectedModuleName = computed<string>(() => {
  return authStore.modules.find((m) => m.key === selectedModuleKey.value)?.name || "—";
});

const moduleByKey = computed<Record<string, AuthModule>>(() => {
  const map: Record<string, AuthModule> = {};
  (authStore.modules || []).forEach((m) => (map[m.key] = m));
  return map;
});

const roleById = computed<Record<string, AuthRole>>(() => {
  const map: Record<string, AuthRole> = {};
  (authStore.roles || []).forEach((r) => (map[r.id] = r));
  return map;
});

const modulePerms = computed<AuthPermission[]>(() => {
  const m = moduleByKey.value[selectedModuleKey.value];
  return m?.permissions || [];
});

const filteredModulePermissions = computed<AuthPermission[]>(() => {
  const kw = String(permKeyword.value || "")
    .trim()
    .toLowerCase();
  if (!kw) return modulePerms.value;

  return modulePerms.value.filter((p) => {
    const n = String(p.name || "").toLowerCase();
    const k = String(p.key || "").toLowerCase();
    return n.includes(kw) || k.includes(kw);
  });
});

const visibleRoles = computed<AuthRole[]>(() => {
  if (!isShowOnlySelectedRole.value) return authStore.roles;
  return authStore.roles.filter((r) => r.id === selectedRoleId.value);
});

const snapshot = ref<GrantsMap>(authStore.cloneCurrentGrants());

function computeChanges(prevGrants: GrantsMap, nowGrants: GrantsMap): ChangeItem[] {
  const prev: GrantsMap = prevGrants || {};
  const now: GrantsMap = nowGrants || {};

  const list: ChangeItem[] = [];
  const roles = authStore.roles || [];
  const permsFlat = authStore.allPermissionsFlat || [];

  roles.forEach((r) => {
    const prevList = Array.isArray(prev[r.id]) ? prev[r.id] : [];
    const nowList = Array.isArray(now[r.id]) ? now[r.id] : [];

    const prevSet = new Set<string>(prevList);
    const nowSet = new Set<string>(nowList);

    permsFlat.forEach((p) => {
      const before = prevSet.has(p.key);
      const after = nowSet.has(p.key);
      if (before === after) return;

      list.push({
        key: `${r.id}__${p.key}`,
        roleId: r.id,
        roleName: r.name,
        moduleKey: p.moduleKey,
        moduleName: p.moduleName,
        permKey: p.key,
        permName: p.name,
        before,
        after,
      });
    });
  });

  return list;
}

const changes = computed<ChangeItem[]>(() =>
  computeChanges(snapshot.value, authStore.grants)
);
const changeCount = computed<number>(() => changes.value.length);

function onTogglePermission(roleId: string, permKey: string) {
  authStore.togglePermission(roleId, permKey);
}

function selectAllInModuleForSelectedRole(enabled: boolean) {
  const roleId = selectedRoleId.value;
  const perms = modulePerms.value;
  perms.forEach((p) => authStore.setPermission(roleId, p.key, enabled));
}

function toggleColumnAll(roleId: string) {
  const perms = modulePerms.value;
  const current = perms.map((p) => authStore.hasPermission(roleId, p.key));
  const allChecked = current.length > 0 && current.every(Boolean);
  perms.forEach((p) => authStore.setPermission(roleId, p.key, !allChecked));
}

function revertOneChange(c: ChangeItem) {
  authStore.setPermission(c.roleId, c.permKey, c.before);
}

function saveSnapshot() {
  snapshot.value = authStore.cloneCurrentGrants();
  showBanner("success", "已儲存", "已將目前設定視為新基準（示範用）。");
  refreshHeatmapSoon();
}

function resetToSnapshot() {
  authStore.replaceGrants(snapshot.value);
  showBanner("info", "已還原", "已還原到上次儲存狀態。");
  refreshHeatmapSoon();
}

function clearChangesByReset() {
  resetToSnapshot();
}

const heatmapEl = ref<HTMLDivElement | null>(null);
let heatmapChart: ECharts | null = null;

type HeatmapCell = [number, number, number, string, string];

function buildHeatmapMatrix(): {
  xLabels: string[];
  yLabels: string[];
  data: HeatmapCell[];
  maxValue: number;
} {
  const roles = authStore.roles || [];
  const modules = authStore.modules || [];

  const xLabels = roles.map((r) => r.name);
  const yLabels = modules.map((m) => m.name);

  const modulePermKeyMap: Record<string, string[]> = {};
  modules.forEach((m) => {
    modulePermKeyMap[m.key] = (m.permissions || []).map((p) => p.key);
  });

  const data: HeatmapCell[] = [];
  let maxValue = 0;

  modules.forEach((m, y) => {
    const permKeys = modulePermKeyMap[m.key] || [];
    roles.forEach((r, x) => {
      const granted = new Set<string>(authStore.grants?.[r.id] || []);
      const v = permKeys.reduce((acc, k) => acc + (granted.has(k) ? 1 : 0), 0);
      maxValue = Math.max(maxValue, v);
      data.push([x, y, v, r.id, m.key]);
    });
  });

  return { xLabels, yLabels, data, maxValue };
}

function renderHeatmap() {
  if (!heatmapEl.value) return;

  if (!heatmapChart) {
    heatmapChart = echarts.init(heatmapEl.value);

    heatmapChart.on("click", (params: any) => {
      const val = params?.data as any[] | undefined;
      if (!val) return;

      const roleId = String(val[3] || "");
      const moduleKey = String(val[4] || "");

      if (roleId) selectedRoleId.value = roleId;
      if (moduleKey) selectedModuleKey.value = moduleKey;
    });
  }

  const { xLabels, yLabels, data, maxValue } = buildHeatmapMatrix();

  const option: EChartsOption = {
    grid: { left: 120, right: 20, top: 20, bottom: 80 },
    tooltip: {
      trigger: "item",
      formatter: (p: any) => {
        const d = (p?.data || []) as any[];
        const x = Number(d[0] ?? 0);
        const y = Number(d[1] ?? 0);
        const v = Number(d[2] ?? 0);
        const role = xLabels[x] || "";
        const mod = yLabels[y] || "";
        return `${role}<br/>${mod}<br/>權限點數：${v}`;
      },
    },
    xAxis: {
      type: "category",
      data: xLabels,
      axisLabel: { interval: 0, rotate: 35 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "category",
      data: yLabels,
      axisLabel: { interval: 0 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    visualMap: {
      min: 0,
      max: Math.max(1, maxValue),
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 18,
    },
    series: [
      {
        type: "heatmap",
        data: data.map((d) => [d[0], d[1], d[2], d[3], d[4]]),
        label: { show: true },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.2)" } },
      } as any,
    ],
  };

  heatmapChart.setOption(option);
}

function refreshHeatmapSoon() {
  nextTick(() => {
    setTimeout(() => {
      renderHeatmap();
      heatmapChart && heatmapChart.resize();
    }, 0);
  });
}

function onResize() {
  heatmapChart && heatmapChart.resize();
}

onMounted(() => {
  renderHeatmap();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  try {
    heatmapChart && heatmapChart.dispose();
  } catch (e) {}
  heatmapChart = null;
});

watch(
  () => authStore.grants,
  () => {
    refreshHeatmapSoon();
  },
  { deep: true }
);

watch(
  () => [selectedRoleId.value, selectedModuleKey.value],
  () => {
    refreshHeatmapSoon();
  }
);
</script>
