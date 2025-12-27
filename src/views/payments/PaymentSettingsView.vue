<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex flex-col gap-1">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          付款方式設定
        </div>
        <div class="text-sm text-slate-500">
          用模擬資料管理付款方式：狀態、手續費、適用範圍、限制與退款規則
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          @click="toggleFilters()"
        >
          <FunnelIcon class="h-5 w-5" />
          篩選
        </button>

        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          @click="openCreate()"
        >
          <PlusIcon class="h-5 w-5" />
          新增付款方式
        </button>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 sm:p-4"
    >
      <div class="flex w-full flex-wrap items-stretch gap-3">
        <button
          type="button"
          class="flex min-w-47.5 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('enabled')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">啟用中</div>
            <CheckCircleIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-emerald-600">
            {{ kpi.enabled }}
          </div>
          <div class="text-xs text-slate-500">前台可選的付款方式</div>
        </button>

        <button
          type="button"
          class="flex min-w-47.5 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('disabled')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">停用</div>
            <NoSymbolIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-slate-600">
            {{ kpi.disabled }}
          </div>
          <div class="text-xs text-slate-500">暫停使用/維護中</div>
        </button>

        <button
          type="button"
          class="flex min-w-47.5 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('draft')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">草稿</div>
            <DocumentTextIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-indigo-600">
            {{ kpi.draft }}
          </div>
          <div class="text-xs text-slate-500">尚未上線的設定</div>
        </button>

        <button
          type="button"
          class="flex min-w-47.5 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickFee('yes')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">有手續費</div>
            <BanknotesIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-amber-600">
            {{ kpi.feeEnabled }}
          </div>
          <div class="text-xs text-slate-500">含固定/百分比/混合</div>
        </button>

        <button
          type="button"
          class="flex min-w-47.5 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickLimit('yes')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">有交易限制</div>
            <ShieldCheckIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-blue-600">
            {{ kpi.limitEnabled }}
          </div>
          <div class="text-xs text-slate-500">金額/次數/3DS</div>
        </button>

        <button
          type="button"
          class="flex min-w-47.5 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickRecent()"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">近 7 天變更</div>
            <ClockIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900">
            {{ kpi.recent7 }}
          </div>
          <div class="text-xs text-slate-500">近期更新的設定</div>
        </button>
      </div>

      <div
        v-if="showFilters"
        class="flex w-full flex-col gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:p-4"
      >
        <div class="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="text-sm font-semibold text-slate-700">關鍵字</div>
            <div
              class="flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
            >
              <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
              <input
                v-model="filtersDraft.keyword"
                type="text"
                class="w-full bg-transparent text-sm text-slate-900 outline-none"
                placeholder="id / 名稱 / provider"
              />
            </div>
          </div>

          <div
            class="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto"
          >
            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-sm font-semibold text-slate-700">狀態</div>
              <select
                v-model="filtersDraft.status"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option value="enabled">啟用</option>
                <option value="disabled">停用</option>
                <option value="draft">草稿</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-sm font-semibold text-slate-700">類型</div>
              <select
                v-model="filtersDraft.type"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option value="online">線上</option>
                <option value="offline">到店</option>
                <option value="bank">轉帳</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-sm font-semibold text-slate-700">通路</div>
              <select
                v-model="filtersDraft.channel"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option value="web">Web</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex w-full items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            @click="syncDraftFromStore()"
          >
            還原
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            @click="applyDraftFilters()"
          >
            套用
          </button>

          <button
            type="button"
            class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            @click="resetAll()"
          >
            重設
          </button>
        </div>
      </div>

      <div
        v-if="selectedCount > 0"
        class="flex w-full flex-col gap-2 rounded-2xl bg-slate-900 p-3 text-white sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-2 text-sm">
          <BanknotesIcon class="h-5 w-5" />
          已選取 {{ selectedCount }} 筆
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            @click="store.bulkSetStatus('enabled')"
          >
            批次啟用
          </button>
          <button
            type="button"
            class="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            @click="store.bulkSetStatus('disabled')"
          >
            批次停用
          </button>
          <button
            type="button"
            class="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            @click="store.bulkRemove()"
          >
            批次刪除
          </button>
          <button
            type="button"
            class="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            @click="store.clearSelection()"
          >
            清除選取
          </button>
        </div>
      </div>

      <div class="flex w-full flex-col gap-3">
        <div
          class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="text-sm text-slate-600">
            共 <span class="font-semibold text-slate-900">{{ total }}</span> 筆， 顯示第
            <span class="font-semibold text-slate-900">{{ pageStart }}</span> -
            <span class="font-semibold text-slate-900">{{ pageEnd }}</span> 筆
          </div>

          <div class="flex items-center justify-end gap-2">
            <select
              v-model.number="pageSizeLocal"
              class="rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              @change="store.setPageSize(pageSizeLocal)"
            >
              <option :value="10">10 / 頁</option>
              <option :value="20">20 / 頁</option>
              <option :value="50">50 / 頁</option>
            </select>
          </div>
        </div>

        <div class="w-full overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table class="w-full min-w-300 bg-white">
            <thead class="bg-slate-50">
              <tr
                class="text-left text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                <th class="w-13 px-4 py-3">
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="isAllSelectedOnPage"
                    @change="store.toggleSelectAllOnPage()"
                  />
                </th>
                <th class="px-4 py-3 w-22.5">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('order')"
                  >
                    排序
                    <span class="text-[11px] opacity-70">{{ sortHint("order") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('name')"
                  >
                    付款方式
                    <span class="text-[11px] opacity-70">{{ sortHint("name") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 w-20">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('type')"
                  >
                    類型
                    <span class="text-[11px] opacity-70">{{ sortHint("type") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 w-40">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('provider')"
                  >
                    Provider
                    <span class="text-[11px] opacity-70">{{ sortHint("provider") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 w-47.5">手續費</th>
                <th class="px-4 py-3 w-55">適用範圍</th>
                <th class="px-4 py-3 w-22.5">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('status')"
                  >
                    狀態
                    <span class="text-[11px] opacity-70">{{ sortHint("status") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 w-42.5">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('updatedAt')"
                  >
                    更新時間
                    <span class="text-[11px] opacity-70">{{
                      sortHint("updatedAt")
                    }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 text-center w-75">操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in pageItems"
                :key="row.id"
                class="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50"
              >
                <td class="px-4 py-3 align-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="store.isSelected(row.id)"
                    @change="store.toggleSelect(row.id)"
                  />
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="font-extrabold text-slate-900">{{ row.order }}</div>
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="flex items-start gap-3">
                    <div
                      class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                    >
                      <img
                        :src="row.iconUrl"
                        alt=""
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-1">
                      <div class="truncate font-semibold text-slate-900">
                        {{ row.name }}
                      </div>
                      <div class="truncate text-xs text-slate-500">
                        {{ row.description }}
                      </div>
                      <div class="truncate text-[11px] text-slate-400">{{ row.id }}</div>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3 align-center">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1"
                    :class="typeBadgeClass(row.type)"
                  >
                    {{ typeLabel(row.type) }}
                  </span>
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="font-semibold text-slate-900">{{ row.provider }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    <span
                      v-if="row.limits.require3DS"
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-700"
                    >
                      3DS
                    </span>
                    <span v-else class="text-slate-400">—</span>
                  </div>
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="font-semibold text-slate-900">
                    {{ store.feeTextOf(row) }}
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    <span
                      v-if="store.hasFee(row)"
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-amber-200 bg-amber-50 text-amber-800"
                    >
                      有手續費
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-slate-200 bg-slate-50 text-slate-700"
                    >
                      無
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      v-for="c in row.scope.channels"
                      :key="`${row.id}_c_${c}`"
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-slate-200 bg-white text-slate-700"
                    >
                      {{ channelLabel(c) }}
                    </span>

                    <span
                      v-if="row.scope.brandIds.length > 0"
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-slate-200 bg-white text-slate-700"
                    >
                      品牌 {{ row.scope.brandIds.length }}
                    </span>

                    <span
                      v-if="row.scope.memberLevels.length > 0"
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-slate-200 bg-white text-slate-700"
                    >
                      等級 {{ row.scope.memberLevels.length }}
                    </span>

                    <span
                      v-if="store.hasLimits(row)"
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-blue-200 bg-blue-50 text-blue-800"
                    >
                      限制
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3 align-center">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1"
                    :class="statusBadgeClass(row.status)"
                  >
                    {{ statusLabel(row.status) }}
                  </span>
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="font-semibold text-slate-900">{{ row.updatedAt }}</div>
                </td>

                <td class="px-4 py-3 align-center">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      @click="openEdit(row.id)"
                    >
                      查看 / 編輯
                    </button>

                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      @click="store.duplicateMethod(row.id)"
                    >
                      複製
                    </button>

                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      @click="toggleRowStatus(row.id, row.status)"
                    >
                      {{ row.status === "enabled" ? "停用" : "啟用" }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="pageItems.length === 0">
                <td colspan="10" class="px-4 py-10 text-center text-sm text-slate-500">
                  查無資料
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          :page="page"
          :page-count="pageCount"
          :window-size="7"
          @change="store.setPage($event)"
        />
      </div>
    </div>

    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-50 flex items-stretch justify-end"
      @mousedown.self="closeDrawer()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>

      <div
        class="relative h-full w-full max-w-140 bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div
          class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="truncate text-lg font-extrabold text-slate-900">
              {{ isCreating ? "新增付款方式" : "付款方式設定" }}
            </div>
            <div class="truncate text-sm text-slate-500">
              {{ draft.id || "—" }}
            </div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            @click="closeDrawer()"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="flex w-full flex-col gap-3 border-b border-slate-100 px-5 py-3">
          <div class="flex w-full flex-wrap items-center gap-2">
            <button
              v-for="t in tabs"
              :key="t.key"
              type="button"
              class="rounded-full px-3 py-1.5 text-sm font-semibold ring-1"
              :class="
                activeTab === t.key
                  ? 'bg-slate-900 text-white ring-slate-900'
                  : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
              "
              @click="activeTab = t.key"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <div class="flex h-full w-full flex-col gap-4 overflow-y-auto px-5 pb-28 pt-4">
          <div v-if="activeTab === 'basic'" class="flex w-full flex-col gap-4">
            <div class="flex w-full flex-col gap-2">
              <div class="text-sm font-semibold text-slate-700">ID</div>
              <input
                v-model="draft.id"
                type="text"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                :disabled="!isCreating"
                placeholder="例如 line_pay"
              />
            </div>

            <div class="flex w-full flex-col gap-2">
              <div class="text-sm font-semibold text-slate-700">顯示名稱</div>
              <input
                v-model="draft.name"
                type="text"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                placeholder="例如 LINE Pay"
              />
            </div>

            <div class="flex w-full flex-col gap-2">
              <div class="text-sm font-semibold text-slate-700">描述</div>
              <input
                v-model="draft.description"
                type="text"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                placeholder="例如 行動支付（Web + App）"
              />
            </div>

            <div class="flex w-full flex-col gap-2">
              <div class="text-sm font-semibold text-slate-700">Icon URL</div>
              <input
                v-model="draft.iconUrl"
                type="text"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                placeholder="貼一個圖片網址"
              />
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                <div class="text-sm font-semibold text-slate-700">類型</div>
                <select
                  v-model="draft.type"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                >
                  <option value="online">線上</option>
                  <option value="offline">到店</option>
                  <option value="bank">轉帳</option>
                </select>
              </div>

              <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                <div class="text-sm font-semibold text-slate-700">Provider</div>
                <input
                  v-model="draft.provider"
                  type="text"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                  placeholder="例如 stripe / linepay"
                />
              </div>
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                <div class="text-sm font-semibold text-slate-700">排序</div>
                <input
                  v-model.number="draft.order"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                />
              </div>

              <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                <div class="text-sm font-semibold text-slate-700">狀態</div>
                <select
                  v-model="draft.status"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                >
                  <option value="enabled">啟用</option>
                  <option value="disabled">停用</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'fee'" class="flex w-full flex-col gap-4">
            <div
              class="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div class="flex flex-col gap-1">
                <div class="text-sm font-extrabold text-slate-900">手續費</div>
                <div class="text-xs text-slate-500">
                  支援 百分比 / 固定 / 混合（可選上限）
                </div>
              </div>

              <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input v-model="draft.fee.enabled" type="checkbox" class="h-4 w-4" />
                啟用
              </label>
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                <div class="text-sm font-semibold text-slate-700">類型</div>
                <select
                  v-model="draft.fee.type"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.fee.enabled"
                >
                  <option value="none">無</option>
                  <option value="percent">百分比</option>
                  <option value="fixed">固定金額</option>
                  <option value="mixed">混合</option>
                </select>
              </div>

              <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                <div class="text-sm font-semibold text-slate-700">上限（0 表示無）</div>
                <input
                  v-model.number="draft.fee.capAmount"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.fee.enabled"
                />
              </div>
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                <div class="text-sm font-semibold text-slate-700">百分比（%）</div>
                <input
                  v-model.number="draft.fee.percent"
                  type="number"
                  inputmode="decimal"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.fee.enabled"
                />
              </div>

              <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                <div class="text-sm font-semibold text-slate-700">固定金額</div>
                <input
                  v-model.number="draft.fee.fixedAmount"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.fee.enabled"
                />
              </div>
            </div>

            <div
              class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200"
            >
              <div class="font-semibold text-slate-900">預覽</div>
              <div class="mt-2">
                {{ feePreview }}
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'scope'" class="flex w-full flex-col gap-4">
            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div class="text-sm font-extrabold text-slate-900">通路</div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.channels.includes('web')"
                    @change="toggleChannel('web')"
                  />
                  Web
                </label>
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.channels.includes('ios')"
                    @change="toggleChannel('ios')"
                  />
                  iOS
                </label>
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.channels.includes('android')"
                    @change="toggleChannel('android')"
                  />
                  Android
                </label>
              </div>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div class="text-sm font-extrabold text-slate-900">
                品牌（不勾選 = 全部）
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <label
                  v-for="b in brands"
                  :key="b.id"
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.brandIds.includes(b.id)"
                    @change="toggleBrand(b.id)"
                  />
                  {{ b.label }}
                </label>
              </div>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div class="text-sm font-extrabold text-slate-900">
                會員等級（不勾選 = 全部）
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.memberLevels.includes('silver')"
                    @change="toggleMemberLevel('silver')"
                  />
                  Silver
                </label>
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.memberLevels.includes('gold')"
                    @change="toggleMemberLevel('gold')"
                  />
                  Gold
                </label>
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="draft.scope.memberLevels.includes('vip')"
                    @change="toggleMemberLevel('vip')"
                  />
                  VIP
                </label>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'limits'" class="flex w-full flex-col gap-4">
            <div
              class="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div class="flex flex-col gap-1">
                <div class="text-sm font-extrabold text-slate-900">交易限制</div>
                <div class="text-xs text-slate-500">
                  金額上下限、每日限額、每人每日次數、3DS
                </div>
              </div>

              <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input v-model="draft.limits.enabled" type="checkbox" class="h-4 w-4" />
                啟用
              </label>
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                <div class="text-sm font-semibold text-slate-700">最低金額</div>
                <input
                  v-model.number="draft.limits.minAmount"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.limits.enabled"
                />
              </div>

              <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                <div class="text-sm font-semibold text-slate-700">最高金額</div>
                <input
                  v-model.number="draft.limits.maxAmount"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.limits.enabled"
                />
              </div>
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                <div class="text-sm font-semibold text-slate-700">每日總限額</div>
                <input
                  v-model.number="draft.limits.dailyLimitAmount"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.limits.enabled"
                />
              </div>

              <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                <div class="text-sm font-semibold text-slate-700">每人每日次數</div>
                <input
                  v-model.number="draft.limits.perUserDailyCount"
                  type="number"
                  inputmode="numeric"
                  class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                  :disabled="!draft.limits.enabled"
                />
              </div>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  v-model="draft.limits.require3DS"
                  type="checkbox"
                  class="h-4 w-4"
                  :disabled="!draft.limits.enabled"
                />
                需要 3DS 驗證（信用卡常用）
              </label>
            </div>
          </div>

          <div v-if="activeTab === 'refund'" class="flex w-full flex-col gap-4">
            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <label
                class="flex items-center gap-2 text-sm font-extrabold text-slate-900"
              >
                <input
                  v-model="draft.refund.refundable"
                  type="checkbox"
                  class="h-4 w-4"
                />
                允許退款
              </label>

              <div class="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-end">
                <div class="flex w-full flex-col gap-2 sm:w-[48%]">
                  <div class="text-sm font-semibold text-slate-700">退款期限（天）</div>
                  <input
                    v-model.number="draft.refund.refundDaysLimit"
                    type="number"
                    inputmode="numeric"
                    class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none disabled:bg-slate-50"
                    :disabled="!draft.refund.refundable"
                  />
                </div>

                <div class="flex w-full flex-col gap-2 sm:w-[52%]">
                  <label
                    class="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <input
                      v-model="draft.refund.manualReviewRefund"
                      type="checkbox"
                      class="h-4 w-4"
                      :disabled="!draft.refund.refundable"
                    />
                    退款需人工審核
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'logs'" class="flex w-full flex-col gap-3">
            <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div class="text-sm font-extrabold text-slate-900">操作紀錄</div>
              <div class="mt-3 flex w-full flex-col gap-2">
                <div
                  v-for="l in draft.logs"
                  :key="l.id"
                  class="flex w-full flex-col gap-1 rounded-xl bg-white p-3 ring-1 ring-slate-200"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-sm font-semibold text-slate-900">{{ l.action }}</div>
                    <div class="text-xs text-slate-500">{{ l.at }}</div>
                  </div>
                  <div class="text-xs text-slate-600">{{ l.summary }}</div>
                  <div class="text-[11px] text-slate-400">{{ l.actor }}</div>
                </div>

                <div
                  v-if="draft.logs.length === 0"
                  class="py-6 text-center text-sm text-slate-500"
                >
                  尚無紀錄
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 py-4"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <span class="font-semibold text-slate-900">更新時間</span>
              <span>{{ draft.updatedAt || "—" }}</span>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="closeDrawer()"
              >
                取消
              </button>

              <button
                v-if="!isCreating"
                type="button"
                class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="store.duplicateMethod(draft.id)"
              >
                複製
              </button>

              <button
                type="button"
                class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                @click="saveDraft()"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  PlusIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";

import AppPagination from "@/components/common/AppPagination.vue";
import { useAdminPaymentMethodStore, type AdminPaymentMethod, type PaymentMethodStatus, type PaymentMethodType, type Channel } from "@/stores/adminPaymentMethodStore";

type TabKey = "basic" | "fee" | "scope" | "limits" | "refund" | "logs";

const store = useAdminPaymentMethodStore();
const { brands } = storeToRefs(store);

const showFilters = ref<boolean>(false);

const pageSizeLocal = ref<number>(10);

const page = computed(() => store.page);
const pageCount = computed(() => store.pageCount);
const total = computed(() => store.total);
const pageItems = computed(() => store.pageItems);
const isAllSelectedOnPage = computed(() => store.isAllSelectedOnPage);
const selectedCount = computed(() => store.selectedIds.length);

const kpi = computed(() => store.kpi);

const pageStart = computed(() => {
  if (total.value <= 0) return 0;
  const size = store.pageSize;
  return (store.page - 1) * size + 1;
});

const pageEnd = computed(() => {
  if (total.value <= 0) return 0;
  const size = store.pageSize;
  const end = store.page * size;
  return Math.min(end, total.value);
});

const filtersDraft = reactive({
  keyword: "",
  status: "" as "" | PaymentMethodStatus,
  type: "" as "" | PaymentMethodType,
  provider: "",
  brandId: "",
  channel: "" as "" | Channel,
  feeEnabled: "" as "" | "yes" | "no",
  limitEnabled: "" as "" | "yes" | "no",
});

function toggleFilters(): void {
  showFilters.value = !showFilters.value;
}

function syncDraftFromStore(): void {
  filtersDraft.keyword = store.filters.keyword;
  filtersDraft.status = store.filters.status;
  filtersDraft.type = store.filters.type;
  filtersDraft.provider = store.filters.provider;
  filtersDraft.brandId = store.filters.brandId;
  filtersDraft.channel = store.filters.channel;
  filtersDraft.feeEnabled = store.filters.feeEnabled;
  filtersDraft.limitEnabled = store.filters.limitEnabled;
}

function applyDraftFilters(): void {
  store.setFilters({
    keyword: filtersDraft.keyword,
    status: filtersDraft.status,
    type: filtersDraft.type,
    provider: filtersDraft.provider,
    brandId: filtersDraft.brandId,
    channel: filtersDraft.channel,
    feeEnabled: filtersDraft.feeEnabled,
    limitEnabled: filtersDraft.limitEnabled,
  });
  store.applyFilters();
  store.clearSelection();
}

function resetAll(): void {
  store.resetFilters();
  store.clearSelection();
  syncDraftFromStore();
}

function quickStatus(status: PaymentMethodStatus): void {
  store.resetFilters();
  store.setFilters({ status });
  store.applyFilters();
  store.clearSelection();
  syncDraftFromStore();
}

function quickFee(v: "yes" | "no"): void {
  store.resetFilters();
  store.setFilters({ feeEnabled: v });
  store.applyFilters();
  store.clearSelection();
  syncDraftFromStore();
}

function quickLimit(v: "yes" | "no"): void {
  store.resetFilters();
  store.setFilters({ limitEnabled: v });
  store.applyFilters();
  store.clearSelection();
  syncDraftFromStore();
}

function quickRecent(): void {
  store.resetFilters();
  store.setFilters({ status: "enabled" });
  store.applyFilters();
  store.clearSelection();
  syncDraftFromStore();
}

function toggleSort(key: string): void {
  store.toggleSort(key);
}

function sortHint(key: string): string {
  const k = String(key || "");
  if (store.sort.key !== k) return "";
  if (store.sort.dir === "asc") return "▲";
  if (store.sort.dir === "desc") return "▼";
  return "";
}

function typeLabel(t: PaymentMethodType): string {
  if (t === "online") return "線上";
  if (t === "offline") return "到店";
  return "轉帳";
}

function statusLabel(s: PaymentMethodStatus): string {
  if (s === "enabled") return "啟用";
  if (s === "disabled") return "停用";
  return "草稿";
}

function channelLabel(c: Channel): string {
  if (c === "web") return "WEB";
  if (c === "ios") return "iOS";
  return "AND";
}

function typeBadgeClass(t: PaymentMethodType): string {
  if (t === "online") return "bg-blue-50 text-blue-800 ring-blue-200";
  if (t === "offline") return "bg-indigo-50 text-indigo-800 ring-indigo-200";
  return "bg-teal-50 text-teal-800 ring-teal-200";
}

function statusBadgeClass(s: PaymentMethodStatus): string {
  if (s === "enabled") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (s === "disabled") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-indigo-50 text-indigo-800 ring-indigo-200";
}

function toggleRowStatus(id: string, cur: PaymentMethodStatus): void {
  const next: PaymentMethodStatus = cur === "enabled" ? "disabled" : "enabled";
  store.setStatus(id, next);
}

watch(
  () => store.pageSize,
  (val) => {
    const n = Number(val) || 10;
    pageSizeLocal.value = n;
  },
  { immediate: true }
);

onMounted(() => {
  syncDraftFromStore();
});

const drawerOpen = ref<boolean>(false);
const isCreating = ref<boolean>(false);
const activeTab = ref<TabKey>("basic");

const tabs = [
  { key: "basic" as TabKey, label: "基本" },
  { key: "fee" as TabKey, label: "手續費" },
  { key: "scope" as TabKey, label: "範圍" },
  { key: "limits" as TabKey, label: "限制" },
  { key: "refund" as TabKey, label: "退款" },
  { key: "logs" as TabKey, label: "紀錄" },
];

function nowText(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

function defaultDraft(): AdminPaymentMethod {
  return {
    id: "",
    name: "",
    description: "",
    type: "online",
    provider: "custom",
    iconUrl: "",
    order: 1,
    status: "draft",
    scope: { brandIds: [], channels: ["web"], memberLevels: [] },
    fee: { enabled: false, type: "none", percent: 0, fixedAmount: 0, capAmount: 0 },
    limits: { enabled: false, minAmount: 0, maxAmount: 0, dailyLimitAmount: 0, perUserDailyCount: 0, require3DS: false },
    refund: { refundable: true, refundDaysLimit: 7, manualReviewRefund: false },
    updatedAt: "",
    logs: [],
  };
}

const draft = reactive<AdminPaymentMethod>(defaultDraft());

const feePreview = computed(() => {
  return store.feeTextOf(draft);
});

function openCreate(): void {
  isCreating.value = true;
  drawerOpen.value = true;
  activeTab.value = "basic";
  const d = defaultDraft();
  d.order = Math.max(1, store.items.length + 1);
  d.updatedAt = nowText();
  Object.assign(draft, d);
}

function openEdit(id: string): void {
  const item = store.getById(id);
  if (!item) return;

  isCreating.value = false;
  drawerOpen.value = true;
  activeTab.value = "basic";

  const cloned = deepClone(item);
  Object.assign(draft, cloned);
}

function closeDrawer(): void {
  drawerOpen.value = false;
  isCreating.value = false;
}

function toggleChannel(c: Channel): void {
  const arr = draft.scope.channels.slice();
  const idx = arr.indexOf(c);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(c);
  draft.scope.channels = arr.length ? arr : ["web"];
}

function toggleBrand(id: string): void {
  const arr = draft.scope.brandIds.slice();
  const idx = arr.indexOf(id);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(id);
  draft.scope.brandIds = arr;
}

function toggleMemberLevel(level: string): void {
  const arr = draft.scope.memberLevels.slice();
  const idx = arr.indexOf(level);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(level);
  draft.scope.memberLevels = arr;
}

function saveDraft(): void {
  const id = String(draft.id || "").trim();
  if (!id) {
    activeTab.value = "basic";
    return;
  }

  const payload: AdminPaymentMethod = deepClone({
    ...draft,
    updatedAt: nowText(),
  });

  store.upsertMethod(payload);
  isCreating.value = false;

  const updated = store.getById(id);
  if (updated) Object.assign(draft, deepClone(updated));

  activeTab.value = "basic";
}
</script>
