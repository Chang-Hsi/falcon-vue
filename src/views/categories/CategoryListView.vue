<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full items-center justify-between pt-2">
      <div class="text-[22px] font-extrabold tracking-wide text-slate-900">分類管理</div>

      <div class="flex items-center gap-2">
        <button
          v-if="!isDragMode"
          type="button"
          class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          @click="openCreateCategory()"
        >
          <PlusIcon class="h-5 w-5" />
          新增分類
        </button>

        <button
          v-if="!isDragMode"
          type="button"
          class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          @click="enterDragMode()"
          :disabled="!store.sortedCategories.length || !store.activeCategory"
        >
          切換手動排序
        </button>

        <button
          v-else
          type="button"
          class="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          @click="exitDragMode()"
        >
          完成排序
        </button>
      </div>
    </div>

    <div class="flex w-full flex-col gap-4 lg:flex-row">
      <div
        class="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:w-80 lg:min-w-80 lg:max-w-80 lg:shrink-0"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 px-4 py-3"
        >
          <div class="text-sm font-extrabold text-slate-900">分類</div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400"
              >{{ store.sortedCategories.length }} 個</span
            >
          </div>
        </div>

        <div class="flex w-full flex-col gap-2 p-3">
          <Draggable
            v-model="dragCategories"
            item-key="id"
            handle=".drag-handle"
            :disabled="!isDragMode"
            @end="onCategoryDragEnd"
            class="flex w-full flex-col gap-2"
          >
            <template #item="{ element: c }">
              <div
                class="flex w-full items-center justify-between rounded-xl border px-3 py-2 transition"
                :class="
                  c.id === store.activeCategoryId
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                "
              >
                <button
                  type="button"
                  class="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
                  @click="onSelectCategory(c.id)"
                >
                  <div class="flex w-full min-w-0 items-center gap-2">
                    <span
                      class="drag-handle select-none text-slate-400"
                      :class="isDragMode ? 'cursor-grab' : 'cursor-default hidden'"
                      aria-label="drag"
                    >
                      ⋮⋮
                    </span>

                    <div
                      class="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-900"
                    >
                      {{ c.label }}
                    </div>

                    <span
                      class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                      :class="
                        c.status === 'enabled'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      "
                    >
                      {{ c.status === "enabled" ? "啟用" : "停用" }}
                    </span>
                  </div>

                  <div class="truncate text-xs text-slate-500">slug：{{ c.slug }}</div>
                </button>

                <div class="flex items-center gap-1 pl-2">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm h-8 min-h-8 rounded-xl px-2 disabled:opacity-40"
                    title="切換啟用"
                    :disabled="isDragMode"
                    @click.stop="toggleCategoryStatus(c.id)"
                  >
                    <PowerIcon class="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    class="btn btn-ghost btn-sm h-8 min-h-8 rounded-xl px-2 disabled:opacity-40"
                    title="刪除"
                    :disabled="isDragMode"
                    @click.stop="askRemoveCategory(c.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </template>
          </Draggable>

          <div
            v-if="!store.sortedCategories.length"
            class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500"
          >
            尚未建立分類
          </div>
        </div>
      </div>

      <div class="flex w-full min-w-0 flex-1 flex-col gap-4">
        <div
          class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex w-full flex-wrap items-end gap-3">
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="flex items-center gap-2">
                <div class="truncate text-sm font-extrabold text-slate-900">
                  {{ activeCategoryTitle }}
                </div>
                <span class="text-xs text-slate-400">{{ activeCategorySub }}</span>
              </div>

              <div v-if="isDragMode" class="mt-1 text-xs font-semibold text-slate-500">
                目前為重新排序模式：已暫停查詢、篩選、分頁。拖拽左側分類或右側內容即可改變順序。
              </div>

              <div class="flex w-full flex-wrap items-center gap-2">
                <div class="flex w-60 flex-col gap-1">
                  <input
                    v-model="draft.keyword"
                    type="text"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-40"
                    placeholder="店家名稱 / ID"
                    :disabled="isDragMode || !store.activeCategory"
                  />
                </div>

                <div class="flex w-50 flex-col gap-1">
                  <select
                    v-model="draft.status"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-40"
                    :disabled="isDragMode || !store.activeCategory"
                  >
                    <option value="">全部</option>
                    <option value="enabled">啟用</option>
                    <option value="disabled">停用</option>
                  </select>
                </div>

                <div class="flex w-80 flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                      @click="store.toggleSort('name')"
                      :title="sortTitle('name', '名稱')"
                      :disabled="isDragMode || !store.activeCategory"
                    >
                      名稱
                      <span class="text-xs text-slate-400">{{ sortSymbol("name") }}</span>
                    </button>

                    <button
                      type="button"
                      class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                      @click="store.toggleSort('rating')"
                      :title="sortTitle('rating', '評分')"
                      :disabled="isDragMode || !store.activeCategory"
                    >
                      評分
                      <span class="text-xs text-slate-400">{{
                        sortSymbol("rating")
                      }}</span>
                    </button>

                    <button
                      type="button"
                      class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                      @click="store.toggleSort('updatedAt')"
                      :title="sortTitle('updatedAt', '更新')"
                      :disabled="isDragMode || !store.activeCategory"
                    >
                      更新
                      <span class="text-xs text-slate-400">{{
                        sortSymbol("updatedAt")
                      }}</span>
                    </button>
                  </div>
                </div>

                <div class="ml-auto flex items-center gap-2">
                  <div class="flex w-44 flex-col gap-1">
                    <select
                      v-model="layoutDraft"
                      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-40"
                      :disabled="isDragMode || !store.activeCategory"
                      @change="applyCategoryLayout()"
                    >
                      <option value="cards">卡片</option>
                      <option value="table">表格</option>
                      <option value="compact">精簡</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    class="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
                    :disabled="isDragMode || !store.activeCategory"
                    @click="applyFilters()"
                  >
                    查詢
                  </button>

                  <button
                    type="button"
                    class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                    :disabled="isDragMode || !store.activeCategory"
                    @click="resetFilters()"
                  >
                    重置
                  </button>

                  <button
                    type="button"
                    class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                    :disabled="isDragMode || !store.activeCategory"
                    @click="openCreateItem()"
                  >
                    <PlusIcon class="h-5 w-5" />
                    新增內容
                  </button>
                </div>
              </div>

              <div
                v-if="store.selection.length && !isDragMode"
                class="mt-2 flex w-full flex-wrap items-center gap-2"
              >
                <div class="text-xs font-semibold text-slate-600">
                  已選取 {{ store.selection.length }} 筆
                </div>

                <div class="flex items-center gap-2">
                  <select
                    v-model="bulkMoveTo"
                    class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">移動到分類...</option>
                    <option
                      v-for="c in store.sortedCategories"
                      :key="c.id"
                      :value="c.id"
                      :disabled="c.id === store.activeCategoryId"
                    >
                      {{ c.label }}
                    </option>
                  </select>

                  <button
                    type="button"
                    class="h-9 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
                    :disabled="!bulkMoveTo"
                    @click="doBulkMove()"
                  >
                    批次移動
                  </button>

                  <button
                    type="button"
                    class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    @click="store.clearSelection()"
                  >
                    清除選取
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div v-if="isCardsMode" class="flex w-full min-w-0 flex-1 flex-col p-4">
            <Draggable
              v-if="isDragMode"
              v-model="dragItems"
              item-key="id"
              handle=".drag-handle"
              :disabled="!canDrag"
              @end="onItemDragEnd"
              class="flex w-full min-w-0 flex-col gap-3"
            >
              <template #item="{ element: it }">
                <div
                  class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50"
                >
                  <span
                    class="drag-handle cursor-grab select-none text-slate-400"
                    aria-label="drag"
                    >⋮⋮</span
                  >

                  <div class="flex items-center gap-2" @click.stop>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="store.isSelected(it.id)"
                      @change="toggleRowSelect(it.id)"
                    />
                  </div>

                  <div
                    class="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      :src="it.coverUrl"
                      alt="cover"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <div class="flex w-full min-w-0 items-center gap-2">
                      <div
                        class="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-900"
                      >
                        {{ it.name }}
                      </div>
                      <span
                        class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                        :class="
                          it.status === 'enabled'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        "
                      >
                        {{ it.status === "enabled" ? "啟用" : "停用" }}
                      </span>
                    </div>

                    <div
                      class="flex w-full flex-wrap items-center gap-2 text-xs text-slate-500"
                    >
                      <span class="font-semibold text-slate-700">{{
                        it.categoryMain
                      }}</span>
                      <span>·</span>
                      <span>{{ it.categorySub }}</span>
                      <span>·</span>
                      <span>評分 {{ it.rating.toFixed(1) }}</span>
                      <span>·</span>
                      <span>{{ it.distance }}</span>
                    </div>

                    <div class="truncate text-xs text-slate-500">
                      優惠：{{ it.badge || "—" }}
                    </div>
                  </div>

                  <div class="flex shrink-0 items-center gap-2" @click.stop>
                    <button
                      type="button"
                      class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                      :disabled="isDragMode"
                      @click="toggleItemStatus(it.id)"
                    >
                      切換狀態
                    </button>

                    <button
                      type="button"
                      class="h-9 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                      :disabled="isDragMode"
                      @click="removeItem(it.id)"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </template>
            </Draggable>

            <div v-else class="flex w-full min-w-0 flex-col gap-3">
              <div
                v-for="it in store.pageItems"
                :key="it.id"
                class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50"
              >
                <div class="flex items-center gap-2" @click.stop>
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    :checked="store.isSelected(it.id)"
                    @change="toggleRowSelect(it.id)"
                  />
                </div>

                <div
                  class="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <img
                    :src="it.coverUrl"
                    alt="cover"
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="flex w-full min-w-0 items-center gap-2">
                    <div
                      class="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-900"
                    >
                      {{ it.name }}
                    </div>
                    <span
                      class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                      :class="
                        it.status === 'enabled'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      "
                    >
                      {{ it.status === "enabled" ? "啟用" : "停用" }}
                    </span>
                  </div>

                  <div
                    class="flex w-full flex-wrap items-center gap-2 text-xs text-slate-500"
                  >
                    <span class="font-semibold text-slate-700">{{
                      it.categoryMain
                    }}</span>
                    <span>·</span>
                    <span>{{ it.categorySub }}</span>
                    <span>·</span>
                    <span>評分 {{ it.rating.toFixed(1) }}</span>
                    <span>·</span>
                    <span>{{ it.distance }}</span>
                  </div>

                  <div class="truncate text-xs text-slate-500">
                    優惠：{{ it.badge || "—" }}
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-2" @click.stop>
                  <button
                    type="button"
                    class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    @click="toggleItemStatus(it.id)"
                  >
                    切換狀態
                  </button>

                  <button
                    type="button"
                    class="h-9 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    @click="removeItem(it.id)"
                  >
                    移除
                  </button>
                </div>
              </div>

              <div
                v-if="!store.pageItems.length"
                class="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500"
              >
                沒有符合條件的內容
              </div>
            </div>
          </div>

          <div v-else class="w-full min-w-0 overflow-auto">
            <table class="table table-zebra w-full min-w-275">
              <thead>
                <tr class="bg-slate-50 text-xs font-extrabold text-slate-500">
                  <th class="w-14">
                    <input
                      v-if="!isDragMode"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="store.isAllSelectedOnPage"
                      @change="toggleSelectAll()"
                    />
                  </th>

                  <th class="min-w-[320px]">
                    <button
                      type="button"
                      class="flex items-center gap-2 disabled:opacity-40"
                      @click.stop="store.toggleSort('name')"
                      :title="sortTitle('name', '名稱')"
                      :disabled="isDragMode"
                    >
                      <span>內容</span>
                      <span class="text-[10px] leading-none">{{
                        sortSymbol("name")
                      }}</span>
                    </button>
                  </th>

                  <th class="min-w-35">分類</th>

                  <th class="min-w-22.5">
                    <button
                      type="button"
                      class="flex items-center gap-2 disabled:opacity-40"
                      @click.stop="store.toggleSort('rating')"
                      :title="sortTitle('rating', '評分')"
                      :disabled="isDragMode"
                    >
                      <span>評分</span>
                      <span class="text-[10px] leading-none">{{
                        sortSymbol("rating")
                      }}</span>
                    </button>
                  </th>

                  <th class="min-w-30">距離</th>
                  <th class="min-w-55">優惠標籤</th>
                  <th class="min-w-22.5">狀態</th>

                  <th class="min-w-40">
                    <button
                      type="button"
                      class="flex items-center gap-2 disabled:opacity-40"
                      @click.stop="store.toggleSort('updatedAt')"
                      :title="sortTitle('updatedAt', '更新時間')"
                      :disabled="isDragMode"
                    >
                      <span>更新時間</span>
                      <span class="text-[10px] leading-none">{{
                        sortSymbol("updatedAt")
                      }}</span>
                    </button>
                  </th>

                  <th class="w-28"></th>
                </tr>
              </thead>

              <Draggable
                v-if="isDragMode"
                v-model="dragItems"
                item-key="id"
                tag="tbody"
                handle=".drag-handle"
                :disabled="!canDrag"
                @end="onItemDragEnd"
              >
                <template #item="{ element: it }">
                  <tr class="text-sm text-slate-700 hover:bg-slate-50">
                    <td>
                      <span class="drag-handle cursor-grab select-none text-slate-400"
                        >⋮⋮</span
                      >
                    </td>

                    <td>
                      <div class="flex items-center gap-3">
                        <div
                          class="h-10 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <img
                            :src="it.coverUrl"
                            alt="cover"
                            class="h-full w-full object-cover"
                          />
                        </div>

                        <div class="flex min-w-0 flex-1 flex-col">
                          <div class="truncate font-bold text-slate-900">
                            {{ it.name }}
                          </div>
                          <div class="truncate text-xs text-slate-500">
                            ID：{{ it.id }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div class="flex flex-col">
                        <div class="text-xs font-semibold text-slate-800">
                          {{ it.categoryMain }}
                        </div>
                        <div class="text-xs text-slate-500">{{ it.categorySub }}</div>
                      </div>
                    </td>

                    <td class="font-semibold text-slate-900">
                      {{ it.rating.toFixed(1) }}
                    </td>
                    <td class="text-slate-600">{{ it.distance }}</td>
                    <td class="truncate text-slate-600">{{ it.badge || "—" }}</td>

                    <td>
                      <span
                        class="rounded-full px-2 py-1 text-xs font-extrabold"
                        :class="
                          it.status === 'enabled'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        "
                      >
                        {{ it.status === "enabled" ? "啟用" : "停用" }}
                      </span>
                    </td>

                    <td class="text-xs text-slate-500">{{ it.updatedAt }}</td>

                    <td class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                          :disabled="isDragMode"
                          @click="toggleItemStatus(it.id)"
                        >
                          狀態
                        </button>

                        <button
                          type="button"
                          class="h-9 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                          :disabled="isDragMode"
                          @click="removeItem(it.id)"
                        >
                          移除
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </Draggable>

              <tbody v-else>
                <tr
                  v-for="it in store.pageItems"
                  :key="it.id"
                  class="text-sm text-slate-700 hover:bg-slate-50"
                >
                  <td @click.stop>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="store.isSelected(it.id)"
                      @change="toggleRowSelect(it.id)"
                    />
                  </td>

                  <td>
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          :src="it.coverUrl"
                          alt="cover"
                          class="h-full w-full object-cover"
                        />
                      </div>

                      <div class="flex min-w-0 flex-1 flex-col">
                        <div class="truncate font-bold text-slate-900">{{ it.name }}</div>
                        <div class="truncate text-xs text-slate-500">ID：{{ it.id }}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="flex flex-col">
                      <div class="text-xs font-semibold text-slate-800">
                        {{ it.categoryMain }}
                      </div>
                      <div class="text-xs text-slate-500">{{ it.categorySub }}</div>
                    </div>
                  </td>

                  <td class="font-semibold text-slate-900">{{ it.rating.toFixed(1) }}</td>
                  <td class="text-slate-600">{{ it.distance }}</td>
                  <td class="truncate text-slate-600">{{ it.badge || "—" }}</td>

                  <td>
                    <span
                      class="rounded-full px-2 py-1 text-xs font-extrabold"
                      :class="
                        it.status === 'enabled'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      "
                    >
                      {{ it.status === "enabled" ? "啟用" : "停用" }}
                    </span>
                  </td>

                  <td class="text-xs text-slate-500">{{ it.updatedAt }}</td>

                  <td class="text-right" @click.stop>
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        @click="toggleItemStatus(it.id)"
                      >
                        狀態
                      </button>

                      <button
                        type="button"
                        class="h-9 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        @click="removeItem(it.id)"
                      >
                        移除
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!store.pageItems.length">
                  <td colspan="9" class="py-10 text-center text-sm text-slate-500">
                    沒有符合條件的內容
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            class="flex w-full items-center justify-between border-t border-slate-200 px-4 py-3"
          >
            <div class="text-xs text-slate-500">
              共 {{ store.filteredActiveItems.length }} 筆 · 第 {{ store.page }} /
              {{ store.pageCount }} 頁
            </div>

            <div class="flex items-center gap-2">
              <select
                v-if="!isDragMode"
                v-model.number="pageSizeDraft"
                class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                @change="applyPageSize()"
              >
                <option :value="10">10 / 頁</option>
                <option :value="20">20 / 頁</option>
                <option :value="50">50 / 頁</option>
              </select>

              <button
                type="button"
                class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                :disabled="isDragMode || store.page <= 1"
                @click="store.setPage(store.page - 1)"
              >
                上一頁
              </button>

              <button
                type="button"
                class="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                :disabled="isDragMode || store.page >= store.pageCount"
                @click="store.setPage(store.page + 1)"
              >
                下一頁
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="errorMsg"
          class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {{ errorMsg }}
        </div>
      </div>
    </div>

    <div
      v-if="createCategoryOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @mousedown.self="closeCreateCategory()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>

      <div
        class="relative mx-4 w-full max-w-130 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-xl font-extrabold text-slate-900">新增分類</div>
            <div class="text-sm text-slate-500">建立 slug 與顯示名稱</div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeCreateCategory()"
          >
            ×
          </button>
        </div>

        <div class="flex flex-col gap-3 px-6 pb-6">
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-bold text-slate-600">分類名稱</div>
            <input
              v-model.trim="createCategoryForm.label"
              type="text"
              class="input input-bordered h-10 w-full rounded-xl"
              placeholder="例如：美味餐廳"
            />
          </div>

          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-bold text-slate-600">slug（英文/數字）</div>
            <input
              v-model.trim="createCategoryForm.slug"
              type="text"
              class="input input-bordered h-10 w-full rounded-xl"
              placeholder="例如：food"
              @input="normalizeSlugInput()"
            />
            <div class="text-xs text-slate-500">用於資料對應與路由</div>
          </div>

          <div
            v-if="createCategoryError"
            class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {{ createCategoryError }}
          </div>

          <div class="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              @click="closeCreateCategory()"
            >
              取消
            </button>

            <button
              type="button"
              class="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              @click="submitCreateCategory()"
            >
              建立
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="createItemOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @mousedown.self="closeCreateItem()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>

      <div
        class="relative mx-4 w-full max-w-180 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-xl font-extrabold text-slate-900">新增內容</div>
            <div class="text-sm text-slate-500">
              新增到目前分類：{{ activeCategoryTitle }}
            </div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeCreateItem()"
          >
            ×
          </button>
        </div>

        <div class="flex flex-col gap-3 px-6 pb-6">
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-bold text-slate-600">內容名稱</div>
            <input
              v-model.trim="createItemForm.name"
              type="text"
              class="input input-bordered h-10 w-full rounded-xl"
              placeholder="例如：85度C 南京東路店"
            />
          </div>

          <div class="flex w-full flex-wrap gap-3">
            <div class="flex w-full flex-col gap-1 lg:w-[48%]">
              <div class="text-xs font-bold text-slate-600">主分類</div>
              <input
                v-model.trim="createItemForm.categoryMain"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：咖啡飲品"
              />
            </div>

            <div class="flex w-full flex-col gap-1 lg:w-[48%]">
              <div class="text-xs font-bold text-slate-600">子分類</div>
              <input
                v-model.trim="createItemForm.categorySub"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：連鎖咖啡"
              />
            </div>
          </div>

          <div class="flex w-full flex-wrap gap-3">
            <div class="flex w-full flex-col gap-1 lg:w-[48%]">
              <div class="text-xs font-bold text-slate-600">評分</div>
              <input
                v-model.number="createItemForm.rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                class="input input-bordered h-10 w-full rounded-xl"
              />
            </div>

            <div class="flex w-full flex-col gap-1 lg:w-[48%]">
              <div class="text-xs font-bold text-slate-600">距離</div>
              <input
                v-model.trim="createItemForm.distance"
                type="text"
                class="input input-bordered h-10 w-full rounded-xl"
                placeholder="例如：0.5km"
              />
            </div>
          </div>

          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-bold text-slate-600">優惠標籤</div>
            <input
              v-model.trim="createItemForm.badge"
              type="text"
              class="input input-bordered h-10 w-full rounded-xl"
              placeholder="例如：指定商品買一送一"
            />
          </div>

          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-bold text-slate-600">封面（網址）</div>
            <input
              v-model.trim="createItemForm.coverUrl"
              type="text"
              class="input input-bordered h-10 w-full rounded-xl"
              placeholder="https://..."
            />
          </div>

          <div
            v-if="createItemError"
            class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {{ createItemError }}
          </div>

          <div class="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              @click="closeCreateItem()"
            >
              取消
            </button>

            <button
              type="button"
              class="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              @click="submitCreateItem()"
            >
              新增
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="confirmRemoveCategoryOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @mousedown.self="closeRemoveCategoryConfirm()"
    >
      <div class="absolute inset-0 bg-slate-900/35"></div>

      <div
        class="relative mx-4 w-full max-w-130 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      >
        <div class="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="text-xl font-extrabold text-slate-900">刪除分類</div>
            <div class="text-sm text-slate-500">刪除後，該分類的關聯清單會消失</div>
          </div>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            @click="closeRemoveCategoryConfirm()"
          >
            ×
          </button>
        </div>

        <div class="flex flex-col gap-3 px-6 pb-6">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            即將刪除：<span class="font-extrabold text-slate-900">{{
              removeCategoryName
            }}</span>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              @click="closeRemoveCategoryConfirm()"
            >
              取消
            </button>

            <button
              type="button"
              class="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              @click="doRemoveCategory()"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import Draggable from "vuedraggable";
import { useAdminCategoryStore, type AdminCategory, type CategoryItem, type CategoryLayout, type ItemStatus } from "@/stores/adminCategoryStore";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { PowerIcon } from "@heroicons/vue/24/solid";

const store = useAdminCategoryStore();

const errorMsg = ref<string>("");

const draft = reactive<{ keyword: string; status: "" | ItemStatus }>({
  keyword: store.filters.keyword,
  status: store.filters.status,
});

watch(
  () => store.activeCategoryId,
  () => {
    draft.keyword = store.filters.keyword;
    draft.status = store.filters.status;
    bulkMoveTo.value = "";
    errorMsg.value = "";
  }
);

const activeCategoryTitle = computed<string>(() => {
  if (!store.activeCategory) return "請先建立分類";
  return store.activeCategory.label;
});

const activeCategorySub = computed<string>(() => {
  if (!store.activeCategory) return "";
  return `slug：${store.activeCategory.slug} · 模式：${store.activeCategory.layout}`;
});

const isCardsMode = computed<boolean>(() => {
  const layout = store.activeCategory?.layout;
  return layout === "cards";
});

const layoutDraft = ref<CategoryLayout>(store.activeCategory?.layout || "cards");
watch(
  () => store.activeCategory?.layout,
  (v) => {
    layoutDraft.value = v || "cards";
  }
);

function applyCategoryLayout() {
  if (!store.activeCategory) return;
  store.updateCategory(store.activeCategory.id, { layout: layoutDraft.value });
}

function applyFilters() {
  if (!store.activeCategory) return;
  store.setFilters({ keyword: draft.keyword, status: draft.status });
}

function resetFilters() {
  store.resetFilters();
  draft.keyword = store.filters.keyword;
  draft.status = store.filters.status;
}

function toggleRowSelect(id: string) {
  store.toggleSelect(id);
}

function toggleSelectAll() {
  store.toggleSelectAllOnPage();
}

const bulkMoveTo = ref<string>("");
function doBulkMove() {
  if (!bulkMoveTo.value) return;
  try {
    store.bulkMoveSelected(bulkMoveTo.value);
    bulkMoveTo.value = "";
  } catch (err) {
    console.error(err);
    errorMsg.value = "批次移動失敗";
  }
}

function toggleCategoryStatus(categoryId: string) {
  const c = store.categoryMap[categoryId];
  if (!c) return;
  const next: ItemStatus = c.status === "enabled" ? "disabled" : "enabled";
  store.updateCategory(categoryId, { status: next });
}

function toggleItemStatus(itemId: string) {
  const it = store.itemsById[itemId];
  if (!it) return;
  const next: ItemStatus = it.status === "enabled" ? "disabled" : "enabled";
  store.updateItem(itemId, { status: next });
}

function removeItem(itemId: string) {
  store.removeItemFromActiveCategory(itemId);
}

function sortSymbol(key: string): string {
  if (store.sort.key !== key) return "⇅";
  if (store.sort.dir === "asc") return "▲";
  if (store.sort.dir === "desc") return "▼";
  return "⇅";
}

function sortTitle(key: string, label: string): string {
  if (store.sort.key !== key) return `排序：${label}（點擊：升冪）`;
  if (store.sort.dir === "asc") return `排序：${label}（目前升冪，點擊：降冪）`;
  if (store.sort.dir === "desc") return `排序：${label}（目前降冪，點擊：回到預設）`;
  return `排序：${label}`;
}

const pageSizeDraft = ref<number>(store.pageSize);
watch(
  () => store.pageSize,
  (v) => {
    pageSizeDraft.value = v;
  }
);

function applyPageSize() {
  store.setPageSize(pageSizeDraft.value);
}

const createCategoryOpen = ref<boolean>(false);
const createCategoryError = ref<string>("");
const createCategoryForm = reactive<{ label: string; slug: string }>({
  label: "",
  slug: "",
});

function openCreateCategory() {
  createCategoryError.value = "";
  createCategoryForm.label = "";
  createCategoryForm.slug = "";
  createCategoryOpen.value = true;
}

function closeCreateCategory() {
  createCategoryOpen.value = false;
}

function normalizeSlugInput() {
  createCategoryForm.slug = String(createCategoryForm.slug || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function submitCreateCategory() {
  createCategoryError.value = "";

  const label = String(createCategoryForm.label || "").trim();
  const slug = String(createCategoryForm.slug || "").trim();

  if (!label) {
    createCategoryError.value = "請輸入分類名稱";
    return;
  }
  if (!slug) {
    createCategoryError.value = "請輸入 slug";
    return;
  }

  try {
    store.createCategory({ label, slug });
    createCategoryOpen.value = false;
  } catch (err) {
    console.error(err);
    createCategoryError.value = "slug 已存在，請換一個";
  }
}

const createItemOpen = ref<boolean>(false);
const createItemError = ref<string>("");

const createItemForm = reactive<{
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: number;
  distance: string;
  badge: string;
  coverUrl: string;
}>({
  name: "",
  categoryMain: "",
  categorySub: "",
  rating: 4.3,
  distance: "1.0km",
  badge: "",
  coverUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&h=800&fit=crop&q=90",
});

function openCreateItem() {
  if (!store.activeCategory) return;
  createItemError.value = "";
  createItemForm.name = "";
  createItemForm.categoryMain = "";
  createItemForm.categorySub = "";
  createItemForm.rating = 4.3;
  createItemForm.distance = "1.0km";
  createItemForm.badge = "";
  createItemForm.coverUrl =
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&h=800&fit=crop&q=90";
  createItemOpen.value = true;
}

function closeCreateItem() {
  createItemOpen.value = false;
}

function submitCreateItem() {
  createItemError.value = "";
  if (!store.activeCategory) return;

  const name = String(createItemForm.name || "").trim();
  if (!name) {
    createItemError.value = "請輸入內容名稱";
    return;
  }

  try {
    store.createItemToActiveCategory({
      name,
      categoryMain: String(createItemForm.categoryMain || "").trim() || "未分類",
      categorySub: String(createItemForm.categorySub || "").trim() || "—",
      rating: Number(createItemForm.rating) || 0,
      distance: String(createItemForm.distance || "").trim() || "—",
      badge: String(createItemForm.badge || "").trim(),
      coverUrl: String(createItemForm.coverUrl || "").trim(),
      status: "enabled",
    });
    createItemOpen.value = false;
  } catch (err) {
    console.error(err);
    createItemError.value = "新增失敗";
  }
}

const confirmRemoveCategoryOpen = ref<boolean>(false);
const removeCategoryId = ref<string>("");

const removeCategoryName = computed<string>(() => {
  const id = removeCategoryId.value;
  const c = id ? store.categoryMap[id] : undefined;
  return c ? c.label : "";
});

function askRemoveCategory(id: string) {
  const c = store.categoryMap[id];
  if (!c) return;
  removeCategoryId.value = id;
  confirmRemoveCategoryOpen.value = true;
}

function closeRemoveCategoryConfirm() {
  confirmRemoveCategoryOpen.value = false;
  removeCategoryId.value = "";
}

function doRemoveCategory() {
  const id = removeCategoryId.value;
  if (!id) return;
  store.removeCategory(id);
  closeRemoveCategoryConfirm();
}

function onSelectCategory(id: string) {
  if (isDragMode.value) return;
  store.setActiveCategory(id);
}

const isDragMode = ref<boolean>(false);

const dragCategories = ref<AdminCategory[]>([]);
const dragItems = ref<CategoryItem[]>([]);

const canDrag = computed<boolean>(() => {
  if (!isDragMode.value) return false;
  if (!store.activeCategoryId) return false;
  if (store.filters.keyword) return false;
  if (store.filters.status) return false;
  if (store.sort.key !== "order" || store.sort.dir !== "asc") return false;
  return true;
});

function enterDragMode() {
  if (!store.activeCategory) return;

  isDragMode.value = true;
  store.sort = { key: "order", dir: "asc" };
  store.resetFilters();
  store.setPage(1);
  store.setPageSize(9999);

  dragCategories.value = store.sortedCategories.slice();
  dragItems.value = store.activeItems.slice();
}

function exitDragMode() {
  isDragMode.value = false;
  store.setPageSize(10);
  store.setPage(1);

  dragCategories.value = store.sortedCategories.slice();
  dragItems.value = store.activeItems.slice();
}

// ✅ 初始化：頁面第一次進來就先把資料塞進 draggable 的 v-model
dragCategories.value = store.sortedCategories.slice();
dragItems.value = store.activeItems.slice();

// ✅ 之後 store 有變動再同步
watch(
  () => [store.sortedCategories, store.activeCategoryId, store.activeItems] as const,
  () => {
    dragCategories.value = store.sortedCategories.slice();
    dragItems.value = store.activeItems.slice();
  },
  {
    immediate: true, // ✅ 重點：第一次就跑
  }
);


function onCategoryDragEnd() {
  if (!isDragMode.value) return;
  const orderedIds = dragCategories.value.map((c) => c.id);

  if (typeof (store as any).reorderCategoriesByIds === "function") {
    (store as any).reorderCategoriesByIds(orderedIds);
    return;
  }

  orderedIds.forEach((id, idx) => {
    store.updateCategory(id, { order: idx + 1 });
  });
}

function onItemDragEnd() {
  if (!canDrag.value) return;
  const orderedIds = dragItems.value.map((x) => x.id);

  if (typeof (store as any).reorderActiveItemIds === "function") {
    (store as any).reorderActiveItemIds(orderedIds);
    return;
  }

  const cid = store.activeCategoryId;
  if (!cid) return;
  store.categoryItemIds[cid] = orderedIds.slice();
  store.updateCategory(cid, {});
}
</script>

<style scoped></style>
