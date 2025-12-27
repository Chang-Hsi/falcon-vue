<!-- src/views/SearchManagementView.vue -->
<template>
  <div class="w-full">
    <div class="flex w-full flex-col gap-4">
      <div class="flex w-full items-center justify-between pt-2">
        <div class="text-[22px] font-extrabold tracking-wide text-slate-900">
          分類管理
        </div>

        <div
          class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end"
        >
          <button
            type="button"
            class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            @click="exportFrontPayload()"
          >
            匯出前台 Payload
          </button>

          <button
            type="button"
            class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            @click="openRulesModal()"
          >
            搜尋規則
          </button>
        </div>
      </div>

      <div
        class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
      >
        <div
          class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-col gap-1">
            <div class="text-[16px] font-bold tracking-wide text-slate-900">快捷狀態</div>
            <div class="text-[12px] tracking-wide text-slate-500">
              熱門字：{{ stats.hotEnabled }}/{{ stats.hotTotal }} ・ 群組：{{
                stats.groupEnabled
              }}/{{ stats.groupTotal }} ・ 店家：{{ stats.storeEnabled }}/{{
                stats.storeTotal
              }}
            </div>
          </div>

          <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div class="flex w-full items-center gap-2 sm:w-70">
              <input
                v-model="quickSearchKeyword"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="快速預覽：輸入關鍵字試搜"
              />
              <button
                type="button"
                class="btn btn-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                @click="activeTab = 'preview'"
              >
                看結果
              </button>
            </div>

            <div class="flex w-full items-center justify-end gap-2 sm:w-auto">
              <button
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="activeTab = 'logs'"
              >
                操作紀錄
              </button>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-row flex-wrap items-center gap-2">
          <button
            type="button"
            class="btn btn-sm rounded-xl"
            :class="
              activeTab === 'hot'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50'
            "
            @click="activeTab = 'hot'"
          >
            熱門關鍵字
          </button>

          <button
            type="button"
            class="btn btn-sm rounded-xl"
            :class="
              activeTab === 'groups'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50'
            "
            @click="activeTab = 'groups'"
          >
            關鍵字群組
          </button>

          <button
            type="button"
            class="btn btn-sm rounded-xl"
            :class="
              activeTab === 'stores'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50'
            "
            @click="activeTab = 'stores'"
          >
            店家資料
          </button>

          <button
            type="button"
            class="btn btn-sm rounded-xl"
            :class="
              activeTab === 'preview'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50'
            "
            @click="activeTab = 'preview'"
          >
            搜尋預覽
          </button>

          <button
            type="button"
            class="btn btn-sm rounded-xl"
            :class="
              activeTab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50'
            "
            @click="activeTab = 'logs'"
          >
            操作紀錄
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6 flex w-full flex-col gap-6">
      <div v-if="activeTab === 'hot'" class="flex w-full flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-col gap-1">
              <div class="text-[16px] font-bold tracking-wide text-slate-900">
                熱門關鍵字
              </div>
              <div class="text-[12px] tracking-wide text-slate-500">
                支援拖曳排序、啟用停用、別名（同義字）
              </div>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div class="flex w-full items-center gap-2 sm:w-70">
                <input
                  v-model="hotFilter"
                  type="text"
                  class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="篩選熱門字（文字/別名）"
                />
              </div>

              <button
                type="button"
                class="btn btn-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                @click="openHotModalForCreate()"
              >
                新增熱門字
              </button>
            </div>
          </div>

          <div class="mt-2 flex w-full flex-col gap-3">
            <div
              class="flex w-full items-center justify-between text-[12px] text-slate-500"
            >
              <div>拖曳左側把手可排序</div>
              <div>排序會同步更新 order</div>
            </div>

            <Draggable
              v-model="hotListForDrag"
              item-key="id"
              handle=".drag-handle"
              class="flex w-full flex-col gap-2"
              :animation="160"
              @end="onHotDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-100 hover:ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex min-w-0 flex-1 flex-row items-start gap-3">
                    <div
                      class="drag-handle mt-0.5 flex px-2 py-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 active:cursor-grabbing"
                    >
                      ☰
                    </div>

                    <div class="flex min-w-0 flex-1 flex-col gap-1">
                      <div class="flex min-w-0 flex-row flex-wrap items-center gap-2">
                        <div
                          class="min-w-0 truncate text-[14px] font-bold text-slate-900"
                        >
                          {{ element.text }}
                        </div>

                        <div
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="
                            element.status === 'enabled'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          "
                        >
                          {{ element.status === "enabled" ? "啟用" : "停用" }}
                        </div>

                        <div class="text-[11px] text-slate-400">
                          order：{{ element.order }}
                        </div>
                      </div>

                      <div
                        class="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
                      >
                        <div
                          class="flex min-w-0 items-center gap-2 text-[12px] text-slate-500"
                        >
                          <span class="text-slate-400">別名</span>
                          <span class="min-w-0 truncate">
                            {{
                              element.aliases.length ? element.aliases.join("、") : "—"
                            }}
                          </span>
                        </div>

                        <div class="flex items-center gap-2 text-[12px] text-slate-400">
                          <span>更新</span>
                          <span>{{ formatTime(element.updatedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex w-full flex-row items-center justify-end gap-2 sm:w-auto"
                  >
                    <button
                      type="button"
                      class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                      @click="toggleHotStatus(element.id)"
                    >
                      {{ element.status === "enabled" ? "停用" : "啟用" }}
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                      @click="openHotModalForEdit(element.id)"
                    >
                      編輯
                    </button>
                  </div>
                </div>
              </template>
            </Draggable>

            <div
              v-if="!hotListForDrag.length"
              class="flex w-full items-center justify-center rounded-2xl bg-slate-50 p-10 text-[13px] text-slate-500"
            >
              找不到符合的熱門關鍵字
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'groups'" class="flex w-full flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-col gap-1">
              <div class="text-[16px] font-bold tracking-wide text-slate-900">
                關鍵字群組
              </div>
              <div class="text-[12px] tracking-wide text-slate-500">
                群組可設別名、權重，並對應店家清單
              </div>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div class="flex w-full items-center gap-2 sm:w-70">
                <input
                  v-model="groupFilter"
                  type="text"
                  class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="篩選群組（標題/別名）"
                />
              </div>

              <button
                type="button"
                class="btn btn-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                @click="openGroupModalForCreate()"
              >
                新增群組
              </button>
            </div>
          </div>

          <div class="mt-2 flex w-full flex-col gap-3">
            <div
              class="flex w-full items-center justify-between text-[12px] text-slate-500"
            >
              <div>拖曳左側把手可排序</div>
              <div>排序會同步更新 order</div>
            </div>

            <Draggable
              v-model="groupListForDrag"
              item-key="id"
              handle=".drag-handle"
              class="flex w-full flex-col gap-2"
              :animation="160"
              @end="onGroupDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-100 hover:ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex min-w-0 flex-1 flex-row items-start gap-3">
                    <div
                      class="drag-handle mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200"
                    >
                      <Bars3Icon class="h-5 w-5" />
                    </div>

                    <div class="flex min-w-0 flex-1 flex-col gap-1">
                      <div class="flex min-w-0 flex-row flex-wrap items-center gap-2">
                        <div
                          class="min-w-0 truncate text-[14px] font-bold text-slate-900"
                        >
                          {{ element.title }}
                        </div>

                        <div
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="
                            element.status === 'enabled'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          "
                        >
                          {{ element.status === "enabled" ? "啟用" : "停用" }}
                        </div>

                        <div class="text-[11px] text-slate-400">
                          order：{{ element.order }}
                        </div>
                        <div class="text-[11px] text-slate-400">
                          weight：{{ element.weight }}
                        </div>
                        <div class="text-[11px] text-slate-400">
                          店家數：{{ countStoresByGroupId(element.id) }}
                        </div>
                      </div>

                      <div
                        class="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
                      >
                        <div
                          class="flex min-w-0 items-center gap-2 text-[12px] text-slate-500"
                        >
                          <span class="text-slate-400">別名</span>
                          <span class="min-w-0 truncate">
                            {{
                              element.aliases.length ? element.aliases.join("、") : "—"
                            }}
                          </span>
                        </div>

                        <div class="flex items-center gap-2 text-[12px] text-slate-400">
                          <span>更新</span>
                          <span>{{ formatTime(element.updatedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex w-full flex-row items-center justify-end gap-2 sm:w-auto"
                  >
                    <button
                      type="button"
                      class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                      @click="toggleGroupStatus(element.id)"
                    >
                      {{ element.status === "enabled" ? "停用" : "啟用" }}
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                      @click="openGroupModalForEdit(element.id)"
                    >
                      編輯
                    </button>
                  </div>
                </div>
              </template>
            </Draggable>

            <div
              v-if="!groupListForDrag.length"
              class="flex w-full items-center justify-center rounded-2xl bg-slate-50 p-10 text-[13px] text-slate-500"
            >
              找不到符合的群組
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'stores'" class="flex w-full flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-col gap-1">
              <div class="text-[16px] font-bold tracking-wide text-slate-900">
                店家資料
              </div>
              <div class="text-[12px] tracking-wide text-slate-500">
                可上下架、調整權重、切換群組與基本欄位
              </div>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                class="btn btn-sm rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                @click="openStoreModalForCreate()"
              >
                新增店家
              </button>
            </div>
          </div>

          <div
            class="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          >
            <div class="flex w-full flex-col gap-2 sm:w-70">
              <div class="text-[12px] text-slate-500">群組</div>
              <select
                v-model="storeFilterGroupId"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">全部</option>
                <option v-for="g in enabledGroupsSorted" :key="g.id" :value="g.id">
                  {{ g.title }}
                </option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">關鍵字</div>
              <input
                v-model="storeFilterText"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="篩選店家（品牌/名稱/分類）"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-45">
              <div class="text-[12px] text-slate-500">狀態</div>
              <select
                v-model="storeFilterStatus"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">全部</option>
                <option value="enabled">啟用</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          </div>

          <div class="mt-4 flex w-full flex-col gap-2">
            <div
              class="flex w-full items-center justify-between text-[12px] text-slate-500"
            >
              <div>共 {{ filteredAdminStores.length }} 筆</div>
              <div>排序：{{ sortLabel }}</div>
            </div>

            <div class="flex w-full flex-col gap-2">
              <div
                v-for="s in filteredAdminStores"
                :key="s.id"
                class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 hover:ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex min-w-0 flex-1 flex-row items-start gap-3">
                  <div
                    class="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
                  >
                    <img
                      v-if="s.coverUrl"
                      :src="s.coverUrl"
                      :alt="s.name"
                      class="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <div class="flex min-w-0 flex-row flex-wrap items-center gap-2">
                      <div class="min-w-0 truncate text-[14px] font-bold text-slate-900">
                        {{ s.name }}
                      </div>

                      <div
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="
                          s.status === 'enabled'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        "
                      >
                        {{ s.status === "enabled" ? "啟用" : "停用" }}
                      </div>

                      <div class="text-[11px] text-slate-400">weight：{{ s.weight }}</div>
                      <div class="text-[11px] text-slate-400">
                        rating：{{ s.rating.toFixed(1) }}
                      </div>
                      <div class="text-[11px] text-slate-400">
                        distance：{{ s.distanceKm.toFixed(1) }}km
                      </div>
                    </div>

                    <div
                      class="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
                    >
                      <div
                        class="flex min-w-0 items-center gap-2 text-[12px] text-slate-500"
                      >
                        <span class="text-slate-400">群組</span>
                        <span class="min-w-0 truncate">{{
                          groupTitleById(s.groupId)
                        }}</span>
                      </div>

                      <div
                        class="flex min-w-0 items-center gap-2 text-[12px] text-slate-500"
                      >
                        <span class="text-slate-400">分類</span>
                        <span class="min-w-0 truncate"
                          >{{ s.categoryMain }} ＞ {{ s.categorySub }}</span
                        >
                      </div>

                      <div
                        v-if="s.badge"
                        class="flex min-w-0 items-center gap-2 text-[12px] text-slate-500"
                      >
                        <span class="text-slate-400">標籤</span>
                        <span class="min-w-0 truncate">{{ s.badge }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 text-[12px] text-slate-400">
                      <span>更新</span>
                      <span>{{ formatTime(s.updatedAt) }}</span>
                    </div>
                  </div>
                </div>

                <div
                  class="flex w-full flex-row items-center justify-end gap-2 sm:w-auto"
                >
                  <button
                    type="button"
                    class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                    @click="toggleStoreStatus(s.id)"
                  >
                    {{ s.status === "enabled" ? "停用" : "啟用" }}
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                    @click="removeStore(s.id)"
                  >
                    刪除
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    @click="openStoreModalForEdit(s.id)"
                  >
                    編輯
                  </button>
                </div>
              </div>

              <div
                v-if="!filteredAdminStores.length"
                class="flex w-full items-center justify-center rounded-2xl bg-slate-50 p-10 text-[13px] text-slate-500"
              >
                找不到符合的店家
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'preview'" class="flex w-full flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-col gap-1">
              <div class="text-[16px] font-bold tracking-wide text-slate-900">
                搜尋預覽
              </div>
              <div class="text-[12px] tracking-wide text-slate-500">
                以後台規則試跑搜尋結果（不影響前台 UI）
              </div>
            </div>
          </div>

          <div
            class="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          >
            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">輸入關鍵字</div>
              <input
                v-model="quickSearchKeyword"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：星巴克 / eslite / 書籍文具 / 連鎖咖啡"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">結果數</div>
              <div
                class="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[13px] text-slate-700 ring-1 ring-slate-200"
              >
                <span>共 {{ previewStores.length }} 筆</span>
                <span class="text-slate-400">limit：{{ admin.rules.resultLimit }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex w-full flex-col gap-2">
            <div
              v-for="s in previewStores"
              :key="s.id"
              class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex min-w-0 flex-1 flex-row items-start gap-3">
                <div
                  class="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
                >
                  <img
                    v-if="s.coverUrl"
                    :src="s.coverUrl"
                    :alt="s.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="flex min-w-0 flex-row flex-wrap items-center gap-2">
                    <div class="min-w-0 truncate text-[14px] font-bold text-slate-900">
                      {{ s.name }}
                    </div>

                    <div class="text-[11px] text-slate-400">
                      {{ groupTitleById(s.groupId) }}
                    </div>

                    <div class="text-[11px] text-slate-400">
                      rating：{{ s.rating.toFixed(1) }}
                    </div>
                    <div class="text-[11px] text-slate-400">
                      distance：{{ s.distanceKm.toFixed(1) }}km
                    </div>
                    <div class="text-[11px] text-slate-400">weight：{{ s.weight }}</div>
                  </div>

                  <div class="min-w-0 truncate text-[12px] text-slate-500">
                    {{ s.categoryMain }} ＞ {{ s.categorySub }}
                  </div>

                  <div
                    v-if="s.badge"
                    class="min-w-0 truncate text-[12px] text-orange-600"
                  >
                    {{ s.badge }}
                  </div>
                </div>
              </div>

              <div class="flex w-full flex-row items-center justify-end gap-2 sm:w-auto">
                <button
                  type="button"
                  class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  @click="openStoreModalForEdit(s.id)"
                >
                  編輯
                </button>
              </div>
            </div>

            <div
              v-if="!previewStores.length"
              class="flex w-full items-center justify-center rounded-2xl bg-slate-50 p-10 text-[13px] text-slate-500"
            >
              目前搜尋沒有結果（或規則設定為空字不回傳）
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'logs'" class="flex w-full flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-col gap-1">
              <div class="text-[16px] font-bold tracking-wide text-slate-900">
                圖形概覽
              </div>
              <div class="text-[12px] tracking-wide text-slate-500">
                只在「搜尋預覽」顯示：左為近 12 個月操作量、右為目前預覽結果分佈
              </div>
            </div>

            <div class="flex w-full flex-row items-center justify-end gap-2 sm:w-auto">
              <button
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="refreshCharts()"
              >
                重新播放動畫
              </button>
            </div>
          </div>

          <div class="mt-3 flex w-full flex-col gap-3 lg:flex-row lg:gap-4">
            <div
              class="flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:flex-1"
            >
              <div class="flex w-full items-center justify-between">
                <div class="text-[13px] font-bold text-slate-900">近 12 個月操作量</div>
                <div class="text-[12px] text-slate-500">total：{{ monthlyOpsTotal }}</div>
              </div>
              <div
                ref="barChartEl"
                class="h-55 w-full rounded-xl bg-white ring-1 ring-slate-200"
              ></div>
              <div class="text-[12px] text-slate-500">
                依照後台操作紀錄（新增/更新/刪除/規則變更）統計
              </div>
            </div>

            <div
              class="flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:w-105"
            >
              <div class="flex w-full items-center justify-between">
                <div class="text-[13px] font-bold text-slate-900">預覽結果分佈</div>
                <div class="text-[12px] text-slate-500">
                  results：{{ previewStores.length }}
                </div>
              </div>
              <div
                ref="donutChartEl"
                class="h-55 w-full rounded-xl bg-white ring-1 ring-slate-200"
              ></div>
              <div class="text-[12px] text-slate-500">
                以群組分佈（groupId）做環形圖，會隨關鍵字即時更新
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 sm:p-5"
        >
          <div
            class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-col gap-1">
              <div class="text-[16px] font-bold tracking-wide text-slate-900">
                操作紀錄
              </div>
              <div class="text-[12px] tracking-wide text-slate-500">
                記錄新增/更新/刪除/規則變更等操作（保留最近 300 筆）
              </div>
            </div>
          </div>

          <div class="mt-2 flex w-full flex-col gap-2">
            <div
              v-for="log in logsForUi"
              :key="log.id"
              class="flex w-full flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-100"
            >
              <div
                class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-2">
                  <div class="text-[13px] font-bold text-slate-900">
                    {{ log.summary }}
                  </div>
                  <div class="text-[11px] text-slate-400">{{ log.entityType }}</div>
                  <div v-if="log.entityId" class="text-[11px] text-slate-400">
                    #{{ log.entityId }}
                  </div>
                  <div class="text-[11px] text-slate-400">{{ log.action }}</div>
                </div>

                <div class="flex items-center gap-2 text-[12px] text-slate-400">
                  <span>{{ log.actor }}</span>
                  <span>{{ formatTime(log.at) }}</span>
                </div>
              </div>

              <div
                v-if="log.payload"
                class="w-full rounded-xl bg-slate-50 p-3 text-[12px] text-slate-700 ring-1 ring-slate-200"
              >
                <div class="flex w-full flex-col gap-2">
                  <div
                    v-for="row in payloadRows(log.payload)"
                    :key="row.k"
                    class="flex w-full flex-row items-start gap-3"
                  >
                    <div class="w-28 shrink-0 text-slate-500">{{ row.k }}</div>

                    <div class="min-w-0 flex-1">
                      <div
                        v-if="row.isComplex"
                        class="flex w-full flex-row items-center gap-2"
                      >
                        <div class="truncate text-slate-700">{{ row.preview }}</div>
                        <button
                          type="button"
                          class="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                          @click="togglePayloadJson(log.id)"
                        >
                          {{ isPayloadJsonOpen(log.id) ? "收合 JSON" : "展開 JSON" }}
                        </button>
                      </div>

                      <div v-else class="wrap-break-word text-slate-800">
                        {{ row.v }}
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="isPayloadJsonOpen(log.id)"
                    class="mt-2 rounded-xl bg-white p-3 text-[12px] text-slate-700 ring-1 ring-slate-200"
                  >
                    <pre class="whitespace-pre-wrap wrap-break-word">{{
                      safeJson(log.payload)
                    }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="!admin.logs.length"
              class="flex w-full items-center justify-center rounded-2xl bg-slate-50 p-10 text-[13px] text-slate-500"
            >
              目前沒有任何操作紀錄
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="toast.show"
      class="fixed bottom-5 left-0 right-0 z-200 flex w-full items-center justify-center px-5"
    >
      <div
        class="flex max-w-130 items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-[13px] text-white shadow-lg"
      >
        <div class="min-w-0 flex-1 truncate">{{ toast.message }}</div>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15"
          @click="toast.show = false"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div
      v-if="hotModal.open"
      class="fixed inset-0 z-150 flex items-center justify-center px-4"
      @mousedown.self="closeHotModal()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>
      <div
        class="relative w-full max-w-190 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-[18px] font-extrabold text-slate-900">
              {{ hotModal.mode === "create" ? "新增熱門關鍵字" : "編輯熱門關鍵字" }}
            </div>
            <div class="text-[12px] text-slate-500">熱門字用於前台建議與快速入口</div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeHotModal()"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="flex w-full flex-col gap-4 px-6 pb-6">
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">文字</div>
              <input
                v-model="hotForm.text"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：星巴克"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-45">
              <div class="text-[12px] text-slate-500">狀態</div>
              <select
                v-model="hotForm.status"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="enabled">啟用</option>
                <option value="disabled">停用</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-45">
              <div class="text-[12px] text-slate-500">排序 order</div>
              <input
                v-model.number="hotForm.order"
                type="number"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="1"
              />
            </div>
          </div>

          <div class="flex w-full flex-col gap-2">
            <div class="text-[12px] text-slate-500">別名（用逗號分隔）</div>
            <input
              v-model="hotForm.aliasesText"
              type="text"
              class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="例如：starbucks, Starbucks, 星巴客"
            />
          </div>

          <div class="flex w-full flex-row items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              @click="closeHotModal()"
            >
              取消
            </button>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              @click="saveHot()"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="groupModal.open"
      class="fixed inset-0 z-150 flex items-center justify-center px-4"
      @mousedown.self="closeGroupModal()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>
      <div
        class="relative w-full max-w-205 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-[18px] font-extrabold text-slate-900">
              {{ groupModal.mode === "create" ? "新增群組" : "編輯群組" }}
            </div>
            <div class="text-[12px] text-slate-500">
              群組是 storesByKeyword 的 key 來源
            </div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeGroupModal()"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="flex w-full flex-col gap-4 px-6 pb-6">
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">群組標題</div>
              <input
                v-model="groupForm.title"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：星巴克"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-45">
              <div class="text-[12px] text-slate-500">狀態</div>
              <select
                v-model="groupForm.status"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="enabled">啟用</option>
                <option value="disabled">停用</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-45">
              <div class="text-[12px] text-slate-500">排序 order</div>
              <input
                v-model.number="groupForm.order"
                type="number"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="1"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-45">
              <div class="text-[12px] text-slate-500">群組權重 weight</div>
              <input
                v-model.number="groupForm.weight"
                type="number"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="0"
              />
            </div>
          </div>

          <div class="flex w-full flex-col gap-2">
            <div class="text-[12px] text-slate-500">別名（用逗號分隔）</div>
            <input
              v-model="groupForm.aliasesText"
              type="text"
              class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="例如：starbucks, 星巴客"
            />
          </div>

          <div class="flex w-full flex-col gap-2">
            <div class="text-[12px] text-slate-500">封面 coverUrl（可空）</div>
            <input
              v-model="groupForm.coverUrl"
              type="text"
              class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="https://..."
            />
          </div>

          <div class="flex w-full flex-row items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              @click="closeGroupModal()"
            >
              取消
            </button>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              @click="saveGroup()"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="storeModal.open"
      class="fixed inset-0 z-150 flex items-center justify-center px-4"
      @mousedown.self="closeStoreModal()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>
      <div
        class="relative w-full max-w-245 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-[18px] font-extrabold text-slate-900">
              {{ storeModal.mode === "create" ? "新增店家" : "編輯店家" }}
            </div>
            <div class="text-[12px] text-slate-500">店家 id 會用於前台 /deal/:id</div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeStoreModal()"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="flex w-full flex-col gap-4 px-6 pb-6">
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:w-65">
              <div class="text-[12px] text-slate-500">id</div>
              <input
                v-model="storeForm.id"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：starbucks-xinyi"
                :disabled="storeModal.mode === 'edit'"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">名稱 name</div>
              <input
                v-model="storeForm.name"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：星巴克 信義門市"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">狀態</div>
              <select
                v-model="storeForm.status"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="enabled">啟用</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          </div>

          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:w-70">
              <div class="text-[12px] text-slate-500">群組 groupId</div>
              <select
                v-model="storeForm.groupId"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option v-for="g in enabledGroupsSorted" :key="g.id" :value="g.id">
                  {{ g.title }}
                </option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">品牌 brand</div>
              <input
                v-model="storeForm.brand"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：星巴克"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">權重 weight</div>
              <input
                v-model.number="storeForm.weight"
                type="number"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="0"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">評分 rating</div>
              <input
                v-model.number="storeForm.rating"
                type="number"
                step="0.1"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="0"
                max="5"
              />
            </div>
          </div>

          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">主分類 categoryMain</div>
              <input
                v-model="storeForm.categoryMain"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：咖啡飲品"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">子分類 categorySub</div>
              <input
                v-model="storeForm.categorySub"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：連鎖咖啡"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">距離 distanceKm</div>
              <input
                v-model.number="storeForm.distanceKm"
                type="number"
                step="0.1"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="0"
              />
            </div>
          </div>

          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">標籤 badge（可空）</div>
              <input
                v-model="storeForm.badge"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="例如：停車方便"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">封面 coverUrl（可空）</div>
              <input
                v-model="storeForm.coverUrl"
                type="text"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="flex w-full flex-row items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              @click="closeStoreModal()"
            >
              取消
            </button>

            <button
              type="button"
              class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              @click="saveStore()"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="rulesModal.open"
      class="fixed inset-0 z-150 flex items-center justify-center px-4"
      @mousedown.self="closeRulesModal()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>
      <div
        class="relative w-full max-w-230 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-[18px] font-extrabold text-slate-900">搜尋規則設定</div>
            <div class="text-[12px] text-slate-500">
              影響後台預覽搜尋，以及匯出到前台的分群策略
            </div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeRulesModal()"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="flex w-full flex-col gap-4 px-6 pb-6">
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">空字行為</div>
              <select
                v-model="rulesForm.emptyKeywordBehavior"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="all">回全部</option>
                <option value="hot">回熱門相關</option>
                <option value="none">回空陣列</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">比對模式</div>
              <select
                v-model="rulesForm.matchMode"
                class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="contains">包含</option>
                <option value="startsWith">開頭符合</option>
                <option value="exact">完全相等</option>
              </select>
            </div>

            <div class="flex w-full flex-col gap-2 sm:w-55">
              <div class="text-[12px] text-slate-500">結果上限 limit</div>
              <input
                v-model.number="rulesForm.resultLimit"
                type="number"
                class="input input-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                min="1"
              />
            </div>

            <div class="flex w-full flex-col gap-2 sm:flex-1">
              <div class="text-[12px] text-slate-500">精準群組優先</div>
              <div
                class="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
              >
                <div class="text-[13px] text-slate-700">exactGroupFirst</div>
                <input
                  v-model="rulesForm.exactGroupFirst"
                  type="checkbox"
                  class="toggle toggle-sm"
                />
              </div>
            </div>
          </div>

          <div
            class="flex w-full flex-col gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
          >
            <div class="text-[13px] font-bold text-slate-900">搜尋欄位</div>

            <div class="flex w-full flex-row flex-wrap gap-3">
              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.fields.brand"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">brand</span>
              </label>

              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.fields.name"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">name</span>
              </label>

              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.fields.categoryMain"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">categoryMain</span>
              </label>

              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.fields.categorySub"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">categorySub</span>
              </label>

              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.fields.badge"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">badge</span>
              </label>
            </div>
          </div>

          <div
            class="flex w-full flex-col gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
          >
            <div class="text-[13px] font-bold text-slate-900">正規化</div>

            <div class="flex w-full flex-row flex-wrap gap-3">
              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.normalize.trim"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">trim</span>
              </label>

              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.normalize.lowerCase"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">lowerCase</span>
              </label>

              <label
                class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <input
                  v-model="rulesForm.normalize.removeSpaces"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="text-[13px] text-slate-700">removeSpaces</span>
              </label>
            </div>
          </div>

          <div
            class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex w-full flex-col gap-2 sm:w-90">
              <div class="text-[12px] text-slate-500">排序策略</div>
              <div
                class="flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:gap-3"
              >
                <select
                  v-model="sortForm.field"
                  class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:w-45"
                >
                  <option value="weight">weight</option>
                  <option value="rating">rating</option>
                  <option value="distanceKm">distanceKm</option>
                  <option value="name">name</option>
                </select>

                <select
                  v-model="sortForm.dir"
                  class="select select-sm w-full rounded-xl bg-white ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:w-40"
                >
                  <option value="desc">desc</option>
                  <option value="asc">asc</option>
                </select>
              </div>
            </div>

            <div
              class="flex w-full flex-row items-center justify-end gap-2 pt-2 sm:w-auto sm:pt-0"
            >
              <button
                type="button"
                class="btn btn-sm rounded-xl bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                @click="closeRulesModal()"
              >
                取消
              </button>

              <button
                type="button"
                class="btn btn-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                @click="saveRules()"
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

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import Draggable from "vuedraggable";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import * as echarts from "echarts";
import { useAdminSearchStore } from "@/stores/adminSearchStore";
import type {
  HotKeyword,
  ItemStatus,
  KeywordGroup,
  SearchRules,
  SortStrategy,
} from "@/stores/adminSearchStore";

type TabKey = "hot" | "groups" | "stores" | "preview" | "logs";
type ModalMode = "create" | "edit";

const admin = useAdminSearchStore();
const { enabledGroups } = storeToRefs(admin);

const activeTab = ref<TabKey>("hot");
const quickSearchKeyword = ref<string>("");

const toast = reactive<{ show: boolean; message: string; timer: number | null }>({
  show: false,
  message: "",
  timer: null,
});

function showToast(message: string) {
  toast.message = message;
  toast.show = true;

  if (toast.timer) window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    toast.show = false;
    toast.timer = null;
  }, 2200);
}

const stats = computed(() => {
  const hotTotal = admin.hotKeywords.length;
  const hotEnabled = admin.hotKeywords.filter((x) => x.status === "enabled").length;

  const groupTotal = admin.groups.length;
  const groupEnabled = admin.groups.filter((x) => x.status === "enabled").length;

  const storeTotal = admin.stores.length;
  const storeEnabled = admin.stores.filter((x) => x.status === "enabled").length;

  return {
    hotTotal,
    hotEnabled,
    groupTotal,
    groupEnabled,
    storeTotal,
    storeEnabled,
  };
});

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

const logsForUi = computed(() => {
  return admin.logs.map((l: any) => {
    return {
      ...l,
      summary: typeof l.summary === "string" ? l.summary : safeJson(l.summary),
      entityType:
        typeof l.entityType === "string" ? l.entityType : safeJson(l.entityType),
      action: typeof l.action === "string" ? l.action : safeJson(l.action),
      actor: typeof l.actor === "string" ? l.actor : safeJson(l.actor),
    };
  });
});

const enabledGroupsSorted = computed(() => {
  return [...enabledGroups.value].sort((a, b) => a.order - b.order);
});

function groupTitleById(groupId: string): string {
  const g = admin.groups.find((x) => x.id === groupId);
  return g?.title ?? "(未設定群組)";
}

function countStoresByGroupId(groupId: string): number {
  return admin.stores.filter((s) => s.groupId === groupId).length;
}

const sortLabel = computed(() => {
  return `${admin.sort.field} ${admin.sort.dir}`;
});

async function exportFrontPayload() {
  const payload = admin.toFrontSearchPayload();
  const jsonText = JSON.stringify(payload, null, 2);

  const ok = await copyToClipboard(jsonText);
  if (ok) showToast("已複製前台 Payload JSON 到剪貼簿");
  else showToast("複製失敗（可能沒有剪貼簿權限）");
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* --------------------------- 圖形（只在 preview） --------------------------- */

const barChartEl = ref<HTMLDivElement | null>(null);
const donutChartEl = ref<HTMLDivElement | null>(null);

let barChart: echarts.ECharts | null = null;
let donutChart: echarts.ECharts | null = null;

const previewStores = computed(() => {
  return admin.searchStores(quickSearchKeyword.value);
});

const monthlySeries = computed(() => {
  const now = new Date();
  const months: { key: string; label: string; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const label = `${m}月`;
    months.push({ key, label, count: 0 });
  }

  const map = new Map<string, number>();
  for (const m of months) map.set(m.key, 0);

  for (const log of admin.logs) {
    const d = new Date(log.at);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return months.map((m) => ({
    ...m,
    count: map.get(m.key) || 0,
  }));
});

const monthlyOpsTotal = computed(() => {
  return monthlySeries.value.reduce((acc, x) => acc + x.count, 0);
});

const donutSeries = computed(() => {
  const list = previewStores.value;
  const map = new Map<string, number>();

  for (const s of list) {
    const gid = s.groupId || "(未設定群組)";
    map.set(gid, (map.get(gid) || 0) + 1);
  }

  const items = Array.from(map.entries()).map(([gid, value]) => {
    return {
      name: groupTitleById(gid),
      value,
      gid,
    };
  });

  items.sort((a, b) => b.value - a.value);
  return items;
});

function buildBarOption() {
  const labels = monthlySeries.value.map((x) => x.label);
  const values = monthlySeries.value.map((x) => x.count);
  const maxV = Math.max(1, ...values);
  const bg = values.map(() => maxV);

  return {
    animation: true,
    animationDuration: 900,
    animationEasing: "cubicOut",
    grid: { left: 12, right: 12, top: 18, bottom: 24, containLabel: true },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { color: "#94a3b8", fontSize: 11 },
      splitLine: { lineStyle: { color: "#eef2f7" } },
    },
    series: [
      {
        name: "背景",
        type: "bar",
        data: bg,
        barWidth: 14,
        itemStyle: {
          color: "#eaf2ff",
          borderRadius: [10, 10, 10, 10],
        },
        silent: true,
        z: 1,
      },
      {
        name: "操作量",
        type: "bar",
        data: values,
        barWidth: 14,
        itemStyle: {
          color: "#2563eb",
          borderRadius: [10, 10, 10, 10],
        },
        z: 2,
      },
    ],
  };
}

function buildDonutOption() {
  const data = donutSeries.value.map((x) => ({ name: x.name, value: x.value }));

  const total = data.reduce((a, b) => a + Number(b.value || 0), 0);
  const centerText = total ? `${total}` : "0";

  return {
    animation: true,
    animationDuration: 950,
    animationEasing: "cubicOut",
    tooltip: { trigger: "item" },
    legend: {
      type: "scroll",
      bottom: 6,
      left: 10,
      right: 10,
      textStyle: { color: "#64748b", fontSize: 11 },
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: centerText,
          fill: "#0f172a",
          fontSize: 22,
          fontWeight: 800,
        },
      },
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "\n\n筆結果",
          fill: "#64748b",
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
    series: [
      {
        name: "分佈",
        type: "pie",
        radius: ["52%", "72%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        data,
      },
    ],
  };
}

function initCharts() {
  if (!barChartEl.value || !donutChartEl.value) return;

  if (barChart) {
    barChart.dispose();
    barChart = null;
  }
  if (donutChart) {
    donutChart.dispose();
    donutChart = null;
  }

  barChart = echarts.init(barChartEl.value);
  donutChart = echarts.init(donutChartEl.value);

  barChart.setOption(buildBarOption() as any, true);
  donutChart.setOption(buildDonutOption() as any, true);

  requestAnimationFrame(() => {
    barChart?.resize();
    donutChart?.resize();
  });
}

function updateCharts() {
  // 你現在 template 圖表是在 logs tab，這裡也一起修正成 logs（不然邏輯會對不起來）
  if (activeTab.value !== "logs") return;
  if (!barChart || !donutChart) return;

  barChart.setOption(buildBarOption() as any, true);
  donutChart.setOption(buildDonutOption() as any, true);
}

function disposeCharts() {
  if (barChart) {
    barChart.dispose();
    barChart = null;
  }
  if (donutChart) {
    donutChart.dispose();
    donutChart = null;
  }
}

function refreshCharts() {
  if (activeTab.value !== "logs") return;
  nextTick(() => initCharts());
}

function onResize() {
  if (activeTab.value !== "logs") return;
  barChart?.resize();
  donutChart?.resize();
}

watch(
  () => activeTab.value,
  async (tab) => {
    if (tab === "logs") {
      await nextTick();
      initCharts();
      window.addEventListener("resize", onResize, { passive: true });
    } else {
      window.removeEventListener("resize", onResize);
      disposeCharts();
    }
  },
  { immediate: true }
);

watch(
  () => [previewStores.value, admin.logs] as const,
  () => {
    updateCharts();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  disposeCharts();
});

const payloadJsonOpenMap = ref<Record<string, boolean>>({});

function isPayloadJsonOpen(id: string): boolean {
  return !!payloadJsonOpenMap.value[id];
}

function togglePayloadJson(id: string) {
  payloadJsonOpenMap.value = {
    ...payloadJsonOpenMap.value,
    [id]: !payloadJsonOpenMap.value[id],
  };
}

function payloadRows(payload: any) {
  if (!payload || typeof payload !== "object") {
    return [{ k: "payload", v: String(payload ?? ""), isComplex: false, preview: "" }];
  }

  const entries = Object.entries(payload);

  return entries.map(([k, v]) => {
    const t = typeof v;
    const isComplex = v && (t === "object" || Array.isArray(v));

    if (!isComplex) {
      return {
        k,
        v: t === "string" ? v : String(v),
        isComplex: false,
        preview: "",
      };
    }

    const preview = Array.isArray(v)
      ? `（陣列）${v.length} 筆`
      : `（物件）${Object.keys(v || {}).length} 個欄位`;

    return {
      k,
      v: "",
      isComplex: true,
      preview,
    };
  });
}

/* --------------------------- 熱門字（拖曳/CRUD） --------------------------- */

const hotFilter = ref<string>("");

const hotListForDrag = ref<HotKeyword[]>([]);
watch(
  () => [admin.hotKeywords, hotFilter.value] as const,
  () => {
    const kw = hotFilter.value.trim().toLowerCase();
    const base = [...admin.hotKeywords].sort((a, b) => a.order - b.order);
    if (!kw) {
      hotListForDrag.value = base;
      return;
    }
    hotListForDrag.value = base.filter((x) => {
      const text = x.text.toLowerCase();
      const aliases = x.aliases.join(" ").toLowerCase();
      return `${text} ${aliases}`.includes(kw);
    });
  },
  { immediate: true, deep: true }
);

function onHotDragEnd() {
  const next = [...hotListForDrag.value].map((x, i) => ({ ...x, order: i + 1 }));
  for (const item of next) {
    admin.upsertHotKeyword(
      {
        id: item.id,
        text: item.text,
        status: item.status,
        order: item.order,
        aliases: item.aliases,
      },
      "admin"
    );
  }
  showToast("熱門關鍵字排序已更新");
}

function toggleHotStatus(id: string) {
  const item = admin.hotKeywords.find((x) => x.id === id);
  if (!item) return;

  const nextStatus: ItemStatus = item.status === "enabled" ? "disabled" : "enabled";
  admin.upsertHotKeyword(
    {
      id: item.id,
      text: item.text,
      status: nextStatus,
      order: item.order,
      aliases: [...item.aliases],
    },
    "admin"
  );
  showToast(`熱門字已${nextStatus === "enabled" ? "啟用" : "停用"}`);
}

const hotModal = reactive<{ open: boolean; mode: ModalMode; editingId: string }>({
  open: false,
  mode: "create",
  editingId: "",
});

const hotForm = reactive<{
  id: string;
  text: string;
  status: ItemStatus;
  order: number;
  aliasesText: string;
}>({
  id: "",
  text: "",
  status: "enabled",
  order: 1,
  aliasesText: "",
});

function openHotModalForCreate() {
  hotModal.open = true;
  hotModal.mode = "create";
  hotModal.editingId = "";
  hotForm.id = `hk_${Date.now()}`;
  hotForm.text = "";
  hotForm.status = "enabled";
  hotForm.order = Math.max(1, admin.hotKeywords.length + 1);
  hotForm.aliasesText = "";
}

function openHotModalForEdit(id: string) {
  const item = admin.hotKeywords.find((x) => x.id === id);
  if (!item) return;

  hotModal.open = true;
  hotModal.mode = "edit";
  hotModal.editingId = id;

  hotForm.id = item.id;
  hotForm.text = item.text;
  hotForm.status = item.status;
  hotForm.order = item.order;
  hotForm.aliasesText = item.aliases.join(", ");
}

function closeHotModal() {
  hotModal.open = false;
}

function saveHot() {
  const text = hotForm.text.trim();
  if (!text) {
    showToast("熱門字文字不可為空");
    return;
  }

  const aliases = splitAliases(hotForm.aliasesText);
  admin.upsertHotKeyword(
    {
      id: hotForm.id,
      text,
      status: hotForm.status,
      order: Math.max(1, Number(hotForm.order) || 1),
      aliases,
    },
    "admin"
  );

  showToast("熱門關鍵字已儲存");
  closeHotModal();

  hotListForDrag.value = [...admin.hotKeywords].sort((a, b) => a.order - b.order);
}

/* --------------------------- 群組（拖曳/CRUD） --------------------------- */

const groupFilter = ref<string>("");

const groupListForDrag = ref<KeywordGroup[]>([]);
watch(
  () => [admin.groups, groupFilter.value] as const,
  () => {
    const kw = groupFilter.value.trim().toLowerCase();
    const base = [...admin.groups].sort((a, b) => a.order - b.order);
    if (!kw) {
      groupListForDrag.value = base;
      return;
    }
    groupListForDrag.value = base.filter((x) => {
      const title = x.title.toLowerCase();
      const aliases = x.aliases.join(" ").toLowerCase();
      return `${title} ${aliases}`.includes(kw);
    });
  },
  { immediate: true, deep: true }
);

function onGroupDragEnd() {
  const next = [...groupListForDrag.value].map((x, i) => ({ ...x, order: i + 1 }));
  for (const item of next) {
    admin.upsertGroup(
      {
        id: item.id,
        title: item.title,
        status: item.status,
        order: item.order,
        aliases: item.aliases,
        coverUrl: item.coverUrl,
        weight: item.weight,
      },
      "admin"
    );
  }
  showToast("群組排序已更新");
}

function toggleGroupStatus(id: string) {
  const item = admin.groups.find((x) => x.id === id);
  if (!item) return;

  const nextStatus: ItemStatus = item.status === "enabled" ? "disabled" : "enabled";
  admin.upsertGroup(
    {
      id: item.id,
      title: item.title,
      status: nextStatus,
      order: item.order,
      aliases: [...item.aliases],
      coverUrl: item.coverUrl,
      weight: item.weight,
    },
    "admin"
  );
  showToast(`群組已${nextStatus === "enabled" ? "啟用" : "停用"}`);
}

const groupModal = reactive<{ open: boolean; mode: ModalMode; editingId: string }>({
  open: false,
  mode: "create",
  editingId: "",
});

const groupForm = reactive<{
  id: string;
  title: string;
  status: ItemStatus;
  order: number;
  weight: number;
  aliasesText: string;
  coverUrl: string;
}>({
  id: "",
  title: "",
  status: "enabled",
  order: 1,
  weight: 80,
  aliasesText: "",
  coverUrl: "",
});

function openGroupModalForCreate() {
  groupModal.open = true;
  groupModal.mode = "create";
  groupModal.editingId = "";

  groupForm.id = `g_${Date.now()}`;
  groupForm.title = "";
  groupForm.status = "enabled";
  groupForm.order = Math.max(1, admin.groups.length + 1);
  groupForm.weight = 80;
  groupForm.aliasesText = "";
  groupForm.coverUrl = "";
}

function openGroupModalForEdit(id: string) {
  const item = admin.groups.find((x) => x.id === id);
  if (!item) return;

  groupModal.open = true;
  groupModal.mode = "edit";
  groupModal.editingId = id;

  groupForm.id = item.id;
  groupForm.title = item.title;
  groupForm.status = item.status;
  groupForm.order = item.order;
  groupForm.weight = item.weight;
  groupForm.aliasesText = item.aliases.join(", ");
  groupForm.coverUrl = item.coverUrl ?? "";
}

function closeGroupModal() {
  groupModal.open = false;
}

function saveGroup() {
  const title = groupForm.title.trim();
  if (!title) {
    showToast("群組標題不可為空");
    return;
  }

  const aliases = splitAliases(groupForm.aliasesText);
  admin.upsertGroup(
    {
      id: groupForm.id,
      title,
      status: groupForm.status,
      order: Math.max(1, Number(groupForm.order) || 1),
      aliases,
      coverUrl: groupForm.coverUrl.trim() || undefined,
      weight: Math.max(0, Number(groupForm.weight) || 0),
    },
    "admin"
  );

  showToast("群組已儲存");
  closeGroupModal();

  groupListForDrag.value = [...admin.groups].sort((a, b) => a.order - b.order);
}

/* --------------------------- 店家（CRUD + 篩選） --------------------------- */

const storeFilterGroupId = ref<string>("");
const storeFilterText = ref<string>("");
const storeFilterStatus = ref<"" | ItemStatus>("");

const filteredAdminStores = computed(() => {
  const groupId = storeFilterGroupId.value;
  const status = storeFilterStatus.value;
  const q = storeFilterText.value.trim().toLowerCase();

  let list = [...admin.stores];

  if (groupId) list = list.filter((s) => s.groupId === groupId);
  if (status) list = list.filter((s) => s.status === status);

  if (q) {
    list = list.filter((s) => {
      const hay = `${s.brand} ${s.name} ${s.categoryMain} ${s.categorySub} ${s.badge}`.toLowerCase();
      return hay.includes(q);
    });
  }

  return list.sort((a, b) => {
    const dir = admin.sort.dir === "asc" ? 1 : -1;
    if (admin.sort.field === "weight") return dir * (a.weight - b.weight);
    if (admin.sort.field === "rating") return dir * (a.rating - b.rating);
    if (admin.sort.field === "distanceKm") return dir * (a.distanceKm - b.distanceKm);
    return dir * a.name.localeCompare(b.name, "zh-Hant");
  });
});

function toggleStoreStatus(id: string) {
  const item = admin.stores.find((x) => x.id === id);
  if (!item) return;

  const nextStatus: ItemStatus = item.status === "enabled" ? "disabled" : "enabled";
  admin.upsertStore(
    {
      id: item.id,
      groupId: item.groupId,
      brand: item.brand,
      name: item.name,
      categoryMain: item.categoryMain,
      categorySub: item.categorySub,
      rating: item.rating,
      distanceKm: item.distanceKm,
      badge: item.badge,
      coverUrl: item.coverUrl,
      status: nextStatus,
      weight: item.weight,
    },
    "admin"
  );
  showToast(`店家已${nextStatus === "enabled" ? "啟用" : "停用"}`);
}

function removeStore(id: string) {
  admin.removeStore(id, "admin");
  showToast("店家已刪除");
}

const storeModal = reactive<{ open: boolean; mode: ModalMode; editingId: string }>({
  open: false,
  mode: "create",
  editingId: "",
});

const storeForm = reactive<{
  id: string;
  groupId: string;
  brand: string;
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: number;
  distanceKm: number;
  badge: string;
  coverUrl: string;
  status: ItemStatus;
  weight: number;
}>({
  id: "",
  groupId: "",
  brand: "",
  name: "",
  categoryMain: "",
  categorySub: "",
  rating: 4.5,
  distanceKm: 1.0,
  badge: "",
  coverUrl: "",
  status: "enabled",
  weight: 50,
});

function openStoreModalForCreate() {
  storeModal.open = true;
  storeModal.mode = "create";
  storeModal.editingId = "";

  const firstGroup = enabledGroupsSorted.value[0];
  storeForm.id = `store_${Date.now()}`;
  storeForm.groupId = firstGroup?.id ?? "";
  storeForm.brand = firstGroup?.title ?? "";
  storeForm.name = "";
  storeForm.categoryMain = "";
  storeForm.categorySub = "";
  storeForm.rating = 4.5;
  storeForm.distanceKm = 1.0;
  storeForm.badge = "";
  storeForm.coverUrl = "";
  storeForm.status = "enabled";
  storeForm.weight = 50;
}

function openStoreModalForEdit(id: string) {
  const item = admin.stores.find((x) => x.id === id);
  if (!item) return;

  storeModal.open = true;
  storeModal.mode = "edit";
  storeModal.editingId = id;

  storeForm.id = item.id;
  storeForm.groupId = item.groupId;
  storeForm.brand = item.brand;
  storeForm.name = item.name;
  storeForm.categoryMain = item.categoryMain;
  storeForm.categorySub = item.categorySub;
  storeForm.rating = item.rating;
  storeForm.distanceKm = item.distanceKm;
  storeForm.badge = item.badge;
  storeForm.coverUrl = item.coverUrl;
  storeForm.status = item.status;
  storeForm.weight = item.weight;
}

function closeStoreModal() {
  storeModal.open = false;
}

watch(
  () => storeForm.groupId,
  (gid) => {
    if (!gid) return;
    const g = admin.groups.find((x) => x.id === gid);
    if (!g) return;

    if (storeModal.open && storeModal.mode === "create") {
      if (!storeForm.brand.trim()) storeForm.brand = g.title;
    }
  }
);

function saveStore() {
  const id = storeForm.id.trim();
  const name = storeForm.name.trim();

  if (!id) {
    showToast("店家 id 不可為空");
    return;
  }
  if (!name) {
    showToast("店家名稱不可為空");
    return;
  }
  if (!storeForm.groupId) {
    showToast("請選擇群組");
    return;
  }

  admin.upsertStore(
    {
      id,
      groupId: storeForm.groupId,
      brand: storeForm.brand.trim() || groupTitleById(storeForm.groupId),
      name,
      categoryMain: storeForm.categoryMain.trim(),
      categorySub: storeForm.categorySub.trim(),
      rating: clampNum(Number(storeForm.rating) || 0, 0, 5),
      distanceKm: Math.max(0, Number(storeForm.distanceKm) || 0),
      badge: storeForm.badge.trim(),
      coverUrl: storeForm.coverUrl.trim(),
      status: storeForm.status,
      weight: Math.max(0, Number(storeForm.weight) || 0),
    },
    "admin"
  );

  showToast("店家已儲存");
  closeStoreModal();
}

function clampNum(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/* --------------------------- 規則（Rules Modal） --------------------------- */

const rulesModal = reactive<{ open: boolean }>({ open: false });

const rulesForm = reactive<SearchRules>({
  exactGroupFirst: true,
  matchMode: "contains",
  emptyKeywordBehavior: "all",
  resultLimit: 200,
  fields: {
    brand: true,
    name: true,
    categoryMain: true,
    categorySub: true,
    badge: false,
  },
  normalize: {
    trim: true,
    lowerCase: true,
    removeSpaces: false,
  },
});

const sortForm = reactive<SortStrategy>({
  field: "weight",
  dir: "desc",
});

function openRulesModal() {
  rulesModal.open = true;

  rulesForm.exactGroupFirst = admin.rules.exactGroupFirst;
  rulesForm.matchMode = admin.rules.matchMode;
  rulesForm.emptyKeywordBehavior = admin.rules.emptyKeywordBehavior;
  rulesForm.resultLimit = admin.rules.resultLimit;

  rulesForm.fields.brand = admin.rules.fields.brand;
  rulesForm.fields.name = admin.rules.fields.name;
  rulesForm.fields.categoryMain = admin.rules.fields.categoryMain;
  rulesForm.fields.categorySub = admin.rules.fields.categorySub;
  rulesForm.fields.badge = admin.rules.fields.badge;

  rulesForm.normalize.trim = admin.rules.normalize.trim;
  rulesForm.normalize.lowerCase = admin.rules.normalize.lowerCase;
  rulesForm.normalize.removeSpaces = admin.rules.normalize.removeSpaces;

  sortForm.field = admin.sort.field;
  sortForm.dir = admin.sort.dir;
}

function closeRulesModal() {
  rulesModal.open = false;
}

function saveRules() {
  admin.setRules(
    {
      exactGroupFirst: rulesForm.exactGroupFirst,
      matchMode: rulesForm.matchMode,
      emptyKeywordBehavior: rulesForm.emptyKeywordBehavior,
      resultLimit: Math.max(1, Number(rulesForm.resultLimit) || 1),
      fields: {
        brand: rulesForm.fields.brand,
        name: rulesForm.fields.name,
        categoryMain: rulesForm.fields.categoryMain,
        categorySub: rulesForm.fields.categorySub,
        badge: rulesForm.fields.badge,
      },
      normalize: {
        trim: rulesForm.normalize.trim,
        lowerCase: rulesForm.normalize.lowerCase,
        removeSpaces: rulesForm.normalize.removeSpaces,
      },
    },
    "admin"
  );

  admin.setSort(
    {
      field: sortForm.field,
      dir: sortForm.dir,
    },
    "admin"
  );

  showToast("搜尋規則已儲存");
  closeRulesModal();
}

/* --------------------------- 小工具 --------------------------- */

function splitAliases(text: string): string[] {
  const arr = String(text || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x);

  const set = new Set<string>();
  for (const a of arr) set.add(a);
  return Array.from(set);
}
</script>

<style scoped>
pre {
  margin: 0;
}
</style>
