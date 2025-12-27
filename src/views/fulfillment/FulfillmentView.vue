<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex flex-col gap-1 pt-3">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          票券 / 兌換狀態管理
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
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
          @click="resetAll()"
        >
          <ArrowPathIcon class="h-5 w-5" />
          重設
        </button>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 sm:p-4"
    >
      <div class="flex w-full flex-wrap items-stretch gap-3">
        <button
          type="button"
          class="flex min-w-45 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('issued')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">待核銷</div>
            <ClockIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-slate-600">
            {{ kpi.issued }}
          </div>
          <div class="text-xs text-slate-500">已兌換到手、尚未核銷</div>
        </button>

        <button
          type="button"
          class="flex min-w-45 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('redeemed')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">已核銷</div>
            <CheckCircleIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-emerald-600">
            {{ kpi.redeemed }}
          </div>
          <div class="text-xs text-slate-500">核銷成功的訂單</div>
        </button>

        <button
          type="button"
          class="flex min-w-45 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickValidState('soon')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">7 天內到期</div>
            <ExclamationTriangleIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-yellow-500">
            {{ kpi.expiringSoon7 }}
          </div>
          <div class="text-xs text-slate-500">有效期限即將到期</div>
        </button>

        <button
          type="button"
          class="flex min-w-45 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('void')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">已作廢</div>
            <NoSymbolIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-rose-600">
            {{ kpi.void }}
          </div>
          <div class="text-xs text-slate-500">後台/使用者取消</div>
        </button>

        <button
          type="button"
          class="flex min-w-45 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('refunded')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">已退點</div>
            <ArrowUturnLeftIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-indigo-600">
            {{ kpi.refunded }}
          </div>
          <div class="text-xs text-slate-500">客服退點處理</div>
        </button>

        <button
          type="button"
          class="flex min-w-45 flex-1 flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 hover:bg-slate-100"
          @click="quickStatus('failed')"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-semibold text-slate-700">失敗 / 異常</div>
            <ExclamationTriangleIcon class="h-5 w-5 text-slate-500" />
          </div>
          <div class="text-2xl font-extrabold text-red-600">
            {{ kpi.failed }}
          </div>
          <div class="text-xs text-slate-500">核銷失敗（模擬）</div>
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
                placeholder="兌換單號 / 票券 / 會員 / 兌換碼"
              />
            </div>
          </div>

          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto"
          >
            <div class="flex w-full flex-col gap-2 sm:w-35">
              <div class="text-sm font-semibold text-slate-700">狀態</div>
              <select
                v-model="filtersDraft.status"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option value="issued">待核銷</option>
                <option value="redeemed">已核銷</option>
                <option value="expired">已過期</option>
                <option value="void">已作廢</option>
                <option value="refunded">已退點</option>
                <option value="failed">失敗</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-35">
              <div class="text-sm font-semibold text-slate-700">品牌</div>
              <select
                v-model="filtersDraft.brandId"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option v-for="b in brands" :key="b.id" :value="b.id">
                  {{ b.label }}
                </option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-65">
              <div class="text-sm font-semibold text-slate-700">票券</div>
              <select
                v-model="filtersDraft.ticketId"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option v-for="t in ticketOptions" :key="t.id" :value="t.id">
                  {{ t.title }}（{{ t.id }}）
                </option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-35">
              <div class="text-sm font-semibold text-slate-700">通路</div>
              <select
                v-model="filtersDraft.channel"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option value="store">門市</option>
                <option value="online">線上</option>
                <option value="pos">POS</option>
                <option value="manual">手動</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-35">
              <div class="text-sm font-semibold text-slate-700">有效狀態</div>
              <select
                v-model="filtersDraft.validState"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              >
                <option value="">全部</option>
                <option value="valid">有效</option>
                <option value="soon">即將到期（7 天）</option>
                <option value="expired">已過期</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
          <div class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <div class="flex flex-col gap-2 sm:w-35">
              <div class="text-sm font-semibold text-slate-700">點數（最小）</div>
              <input
                v-model="filtersDraft.pointsMin"
                type="number"
                inputmode="numeric"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                placeholder="例如 200"
              />
            </div>

            <div class="flex flex-col gap-2 sm:w-35">
              <div class="text-sm font-semibold text-slate-700">點數（最大）</div>
              <input
                v-model="filtersDraft.pointsMax"
                type="number"
                inputmode="numeric"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
                placeholder="例如 500"
              />
            </div>

            <div class="flex flex-col gap-2 sm:w-60">
              <div class="text-sm font-semibold text-slate-700">兌換日期（起）</div>
              <input
                v-model="filtersDraft.createdFrom"
                type="date"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              />
            </div>

            <div class="flex flex-col gap-2 sm:w-60">
              <div class="text-sm font-semibold text-slate-700">兌換日期（迄）</div>
              <input
                v-model="filtersDraft.createdTo"
                type="date"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              />
            </div>

            <div class="flex flex-col gap-2 sm:w-60">
              <div class="text-sm font-semibold text-slate-700">核銷日期（起）</div>
              <input
                v-model="filtersDraft.redeemedFrom"
                type="date"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              />
            </div>

            <div class="flex flex-col gap-2 sm:w-60">
              <div class="text-sm font-semibold text-slate-700">核銷日期（迄）</div>
              <input
                v-model="filtersDraft.redeemedTo"
                type="date"
                class="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none"
              />
            </div>
          </div>

          <div class="flex w-full items-center justify-end gap-2 lg:w-auto">
            <button
              type="button"
              class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 w-15"
              @click="syncDraftFromStore()"
            >
              還原
            </button>
            <button
              type="button"
              class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 w-15"
              @click="applyDraftFilters()"
            >
              套用
            </button>
          </div>
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
            @click="bulkVoid()"
          >
            批次作廢
          </button>
          <button
            type="button"
            class="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            @click="bulkMarkRedeemed()"
          >
            批次補登核銷
          </button>
          <button
            type="button"
            class="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            @click="bulkRefund()"
          >
            批次退點
          </button>
          <button
            type="button"
            class="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            @click="redeemStore.clearSelection()"
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
              @change="redeemStore.setPageSize(pageSizeLocal)"
            >
              <option :value="10">10 / 頁</option>
              <option :value="20">20 / 頁</option>
              <option :value="50">50 / 頁</option>
            </select>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50"
              :disabled="page <= 1"
              @click="redeemStore.setPage(page - 1)"
            >
              <ChevronLeftIcon class="h-5 w-5 text-slate-700" />
            </button>

            <div class="min-w-27.5 text-center text-sm font-semibold text-slate-700">
              第 {{ page }} / {{ pageCount }} 頁
            </div>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50"
              :disabled="page >= pageCount"
              @click="redeemStore.setPage(page + 1)"
            >
              <ChevronRightIcon class="h-5 w-5 text-slate-700" />
            </button>
          </div>
        </div>

        <div class="w-full overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table class="w-full min-w-275 bg-white">
            <thead class="bg-slate-50">
              <tr
                class="text-left text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                <th class="w-13 px-4 py-3">
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="isAllSelectedOnPage"
                    @change="redeemStore.toggleSelectAllOnPage()"
                  />
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('createdAt')"
                  >
                    兌換時間
                    <span class="text-[11px] opacity-70">{{
                      sortHint("createdAt")
                    }}</span>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <div class="flex items-center gap-1">兌換單號</div>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('ticketTitle')"
                  >
                    票券
                    <span class="text-[11px] opacity-70">{{
                      sortHint("ticketTitle")
                    }}</span>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('memberName')"
                  >
                    會員
                    <span class="text-[11px] opacity-70">{{
                      sortHint("memberName")
                    }}</span>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('points')"
                  >
                    點數
                    <span class="text-[11px] opacity-70">{{ sortHint("points") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('status')"
                  >
                    狀態
                    <span class="text-[11px] opacity-70">{{ sortHint("status") }}</span>
                  </button>
                </th>
                <th class="px-4 py-3">通路 / 門市</th>
                <th class="px-4 py-3 w-37.5">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('validTo')"
                  >
                    到期日
                    <span class="text-[11px] opacity-70">{{ sortHint("validTo") }}</span>
                  </button>
                </th>

                <th class="px-4 py-3 w-25">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-slate-900"
                    @click="toggleSort('redeemedAt')"
                  >
                    核銷時間
                    <span class="text-[11px] opacity-70">{{
                      sortHint("redeemedAt")
                    }}</span>
                  </button>
                </th>
                <th class="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in pageItems"
                :key="row.id"
                class="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50"
              >
                <td class="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="redeemStore.isSelected(row.id)"
                    @change="redeemStore.toggleSelect(row.id)"
                  />
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="font-semibold text-slate-900">{{ row.createdAt }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ brandLabel(row.brandId) }}
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="font-extrabold text-slate-900">{{ row.id }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ row.code }}</div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="flex items-start gap-3">
                    <div
                      class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                    >
                      <img
                        :src="row.ticketImageUrl"
                        alt=""
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-1">
                      <div class="truncate font-semibold text-slate-900">
                        {{ row.ticketTitle }}
                      </div>
                      <div class="truncate text-xs text-slate-500">
                        {{ row.ticketSubtitle }}
                      </div>
                      <div class="truncate text-[11px] text-slate-400">
                        {{ row.ticketId }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="font-semibold text-slate-900">{{ row.member.name }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ row.member.memberId }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ row.member.phone }}</div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="font-extrabold text-slate-900">{{ row.points }}</div>
                </td>

                <td class="px-4 py-3 align-top">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1"
                    :class="statusBadgeClass(row.status)"
                  >
                    {{ statusLabel(row.status) }}
                  </span>

                  <div class="mt-2">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1"
                      :class="validBadgeClass(redeemStore.validStateOf(row))"
                    >
                      {{ validLabel(redeemStore.validStateOf(row)) }}
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="font-semibold text-slate-900">
                    {{ channelLabel(row.channel) }}
                  </div>
                  <div class="mt-1 text-xs text-slate-500">{{ row.storeName }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ row.operatorName }}</div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="font-semibold text-slate-900">{{ row.validTo }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ row.validFrom }} ～ {{ row.validTo }}
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div v-if="row.redeemedAt" class="font-semibold text-slate-900">
                    {{ row.redeemedAt }}
                  </div>
                  <div v-else class="text-slate-400">—</div>
                  <div v-if="row.note" class="mt-1 text-xs text-slate-500">
                    {{ row.note }}
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      @click="openDrawer(row.id)"
                    >
                      查看
                    </button>

                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      :disabled="row.status !== 'issued'"
                      @click="redeemStore.markRedeemed(row.id)"
                    >
                      補登核銷
                    </button>

                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      :disabled="row.status !== 'redeemed'"
                      @click="redeemStore.refundRedemption(row.id)"
                    >
                      退點
                    </button>

                    <button
                      type="button"
                      class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      :disabled="row.status === 'void'"
                      @click="redeemStore.voidRedemption(row.id)"
                    >
                      作廢
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="pageItems.length === 0">
                <td colspan="11" class="px-4 py-10 text-center text-sm text-slate-500">
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
          @change="redeemStore.setPage($event)"
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
        class="relative h-full w-full max-w-130 bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div
          class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="truncate text-lg font-extrabold text-slate-900">兌換單詳情</div>
            <div class="truncate text-sm text-slate-500">
              {{ activeItem?.id || "—" }}
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

        <div class="flex h-full w-full flex-col gap-4 overflow-y-auto px-5 pb-6 pt-4">
          <div v-if="activeItem" class="flex w-full flex-col gap-4">
            <div
              class="flex w-full flex-col gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div class="flex w-full items-start gap-3">
                <div
                  class="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
                >
                  <img
                    :src="activeItem.ticketImageUrl"
                    alt=""
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="truncate text-base font-extrabold text-slate-900">
                    {{ activeItem.ticketTitle }}
                  </div>
                  <div class="truncate text-sm text-slate-600">
                    {{ activeItem.ticketSubtitle }}
                  </div>
                  <div class="truncate text-xs text-slate-400">
                    {{ activeItem.ticketId }}
                  </div>
                </div>
              </div>

              <div class="flex w-full flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1"
                  :class="statusBadgeClass(activeItem.status)"
                >
                  {{ statusLabel(activeItem.status) }}
                </span>

                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-slate-200 text-slate-700"
                >
                  {{ brandLabel(activeItem.brandId) }}
                </span>

                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-slate-200 text-slate-900"
                >
                  {{ activeItem.points }} 點
                </span>
              </div>

              <div class="flex w-full flex-col gap-2 text-sm text-slate-700">
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">有效期限</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.validFrom }} ～ {{ activeItem.validTo }}
                  </div>
                </div>

                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">兌換時間</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.createdAt }}
                  </div>
                </div>

                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">核銷時間</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.redeemedAt || "—" }}
                  </div>
                </div>

                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">兌換碼</div>
                  <div class="font-mono text-xs font-bold text-slate-900">
                    {{ activeItem.code }}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
            >
              <div class="text-sm font-extrabold text-slate-900">會員資訊</div>
              <div class="flex w-full flex-col gap-2 text-sm text-slate-700">
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">會員</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.member.name }}
                  </div>
                </div>
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">會員編號</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.member.memberId }}
                  </div>
                </div>
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">電話</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.member.phone }}
                  </div>
                </div>
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">Email</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.member.email }}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
            >
              <div class="text-sm font-extrabold text-slate-900">核銷資訊</div>
              <div class="flex w-full flex-col gap-2 text-sm text-slate-700">
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">通路</div>
                  <div class="font-semibold text-slate-900">
                    {{ channelLabel(activeItem.channel) }}
                  </div>
                </div>
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">門市</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.storeName }}
                  </div>
                </div>
                <div class="flex w-full items-center justify-between gap-3">
                  <div class="text-slate-500">操作人員</div>
                  <div class="font-semibold text-slate-900">
                    {{ activeItem.operatorName }}
                  </div>
                </div>
                <div
                  v-if="activeItem.note"
                  class="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200"
                >
                  {{ activeItem.note }}
                </div>
              </div>
            </div>

            <div class="flex w-full flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                :disabled="activeItem.status !== 'issued'"
                @click="redeemStore.markRedeemed(activeItem.id)"
              >
                補登核銷
              </button>

              <button
                type="button"
                class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                :disabled="activeItem.status !== 'redeemed'"
                @click="redeemStore.refundRedemption(activeItem.id)"
              >
                退點
              </button>

              <button
                type="button"
                class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                :disabled="activeItem.status === 'void'"
                @click="redeemStore.voidRedemption(activeItem.id)"
              >
                作廢
              </button>

              <button
                type="button"
                class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                @click="closeDrawer()"
              >
                關閉
              </button>
            </div>
          </div>

          <div v-else class="py-10 text-center text-sm text-slate-500">查無資料</div>
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
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/outline";

import { useAdminTicketStore } from "@/stores/adminTicketStore";
import { useAdminTicketRedeemStore, type RedemptionStatus } from "@/stores/adminTicketRedeemStore";
import AppPagination from "@/components/common/AppPagination.vue";


type BrandOption = { id: string; label: string };

const ticketStore = useAdminTicketStore();
const redeemStore = useAdminTicketRedeemStore();

const { brands } = storeToRefs(redeemStore);

const showFilters = ref<boolean>(false);
const drawerOpen = ref<boolean>(false);
const activeId = ref<string>("");

const pageSizeLocal = ref<number>(10);

const kpi = computed(() => redeemStore.kpi);

const page = computed(() => redeemStore.page);
const pageCount = computed(() => redeemStore.pageCount);
const total = computed(() => redeemStore.total);
const pageItems = computed(() => redeemStore.pageItems);
const isAllSelectedOnPage = computed(() => redeemStore.isAllSelectedOnPage);
const selectedCount = computed(() => redeemStore.selectedIds.length);

const pageStart = computed(() => {
  if (total.value <= 0) return 0;
  const size = redeemStore.pageSize;
  return (redeemStore.page - 1) * size + 1;
});

const pageEnd = computed(() => {
  if (total.value <= 0) return 0;
  const size = redeemStore.pageSize;
  const end = redeemStore.page * size;
  return Math.min(end, total.value);
});

const ticketOptions = computed(() => {
  return ticketStore.items.map((t) => ({
    id: t.id,
    title: t.title,
  }));
});

const activeItem = computed(() => {
  const id = String(activeId.value || "");
  if (!id) return null;
  return redeemStore.getById(id);
});

const filtersDraft = reactive({
  keyword: "",
  status: "" as "" | RedemptionStatus,
  brandId: "",
  ticketId: "",
  channel: "" as "" | "store" | "online" | "pos" | "manual",
  validState: "" as "" | "valid" | "expired" | "soon",
  createdFrom: "",
  createdTo: "",
  redeemedFrom: "",
  redeemedTo: "",
  pointsMin: "",
  pointsMax: "",
});

function toggleFilters(): void {
  showFilters.value = !showFilters.value;
}

function syncDraftFromStore(): void {
  filtersDraft.keyword = redeemStore.filters.keyword;
  filtersDraft.status = redeemStore.filters.status;
  filtersDraft.brandId = redeemStore.filters.brandId;
  filtersDraft.ticketId = redeemStore.filters.ticketId;
  filtersDraft.channel = redeemStore.filters.channel;
  filtersDraft.validState = redeemStore.filters.validState;
  filtersDraft.createdFrom = redeemStore.filters.createdFrom;
  filtersDraft.createdTo = redeemStore.filters.createdTo;
  filtersDraft.redeemedFrom = redeemStore.filters.redeemedFrom;
  filtersDraft.redeemedTo = redeemStore.filters.redeemedTo;
  filtersDraft.pointsMin = redeemStore.filters.pointsMin;
  filtersDraft.pointsMax = redeemStore.filters.pointsMax;
}

function applyDraftFilters(): void {
  redeemStore.setFilters({
    keyword: filtersDraft.keyword,
    status: filtersDraft.status,
    brandId: filtersDraft.brandId,
    ticketId: filtersDraft.ticketId,
    channel: filtersDraft.channel,
    validState: filtersDraft.validState,
    createdFrom: filtersDraft.createdFrom,
    createdTo: filtersDraft.createdTo,
    redeemedFrom: filtersDraft.redeemedFrom,
    redeemedTo: filtersDraft.redeemedTo,
    pointsMin: filtersDraft.pointsMin,
    pointsMax: filtersDraft.pointsMax,
  });
  redeemStore.applyFilters();
}

function resetAll(): void {
  redeemStore.resetFilters();
  redeemStore.clearSelection();
  syncDraftFromStore();
}

function quickStatus(status: RedemptionStatus): void {
  redeemStore.resetFilters();
  redeemStore.setFilters({ status });
  redeemStore.applyFilters();
  redeemStore.clearSelection();
  syncDraftFromStore();
}

function quickValidState(validState: "valid" | "expired" | "soon"): void {
  redeemStore.resetFilters();
  redeemStore.setFilters({ validState });
  redeemStore.applyFilters();
  redeemStore.clearSelection();
  syncDraftFromStore();
}

function openDrawer(id: string): void {
  activeId.value = String(id || "");
  drawerOpen.value = true;
}

function closeDrawer(): void {
  drawerOpen.value = false;
  activeId.value = "";
}

function brandLabel(brandId: string): string {
  const id = String(brandId || "");
  const map = redeemStore.brandLabelMap;
  return map[id] || id || "—";
}

function channelLabel(ch: string): string {
  if (ch === "store") return "門市";
  if (ch === "online") return "線上";
  if (ch === "pos") return "POS";
  if (ch === "manual") return "手動";
  return "—";
}

function statusLabel(s: RedemptionStatus): string {
  if (s === "issued") return "待核銷";
  if (s === "redeemed") return "已核銷";
  if (s === "expired") return "已過期";
  if (s === "void") return "已作廢";
  if (s === "refunded") return "已退點";
  if (s === "failed") return "失敗";
  return "—";
}

function statusBadgeClass(s: RedemptionStatus): string {
  if (s === "issued") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (s === "redeemed") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (s === "expired") return "bg-slate-100 text-slate-700 ring-slate-200";
  if (s === "void") return "bg-rose-50 text-rose-800 ring-rose-200";
  if (s === "refunded") return "bg-indigo-50 text-indigo-800 ring-indigo-200";
  return "bg-orange-50 text-orange-800 ring-orange-200";
}

function validLabel(v: "valid" | "expired" | "soon"): string {
  if (v === "valid") return "有效";
  if (v === "soon") return "即將到期";
  return "已過期";
}

function validBadgeClass(v: "valid" | "expired" | "soon"): string {
  if (v === "valid") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (v === "soon") return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function toggleSort(key: string): void {
  redeemStore.toggleSort(key);
}

function sortHint(key: string): string {
  const k = String(key || "");
  if (redeemStore.sort.key !== k) return "";
  if (redeemStore.sort.dir === "asc") return "▲";
  if (redeemStore.sort.dir === "desc") return "▼";
  return "";
}

function bulkVoid(): void {
  const ids = redeemStore.selectedIds.slice();
  for (const id of ids) redeemStore.voidRedemption(id);
  redeemStore.clearSelection();
}

function bulkMarkRedeemed(): void {
  const ids = redeemStore.selectedIds.slice();
  for (const id of ids) redeemStore.markRedeemed(id);
  redeemStore.clearSelection();
}

function bulkRefund(): void {
  const ids = redeemStore.selectedIds.slice();
  for (const id of ids) redeemStore.refundRedemption(id);
  redeemStore.clearSelection();
}

watch(
  () => redeemStore.pageSize,
  (val) => {
    const n = Number(val) || 10;
    pageSizeLocal.value = n;
  },
  { immediate: true }
);

onMounted(() => {
  redeemStore.ensureSeeded(ticketStore.items);
  syncDraftFromStore();
});
</script>
