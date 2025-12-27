<template>
  <div class="flex w-full flex-col gap-4">
    <div
      class="flex w-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full items-start justify-between gap-3">
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="text-[20px] font-extrabold tracking-wide text-slate-900">
            {{ isCreate ? "新增主題" : "編輯主題" }}
          </div>
          <div class="text-[13px] text-slate-500">
            {{ isCreate ? "建立新的主題內容" : "調整主題內容、排序與狀態" }}
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            @click="cancel"
          >
            取消
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            @click="save"
          >
            儲存
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="text-[14px] font-bold text-slate-900">基本資訊</div>

      <div class="flex w-full flex-col gap-3">
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
          <div class="flex w-full flex-col gap-1 md:flex-1">
            <div class="text-[12px] font-semibold text-slate-700">主題標題</div>
            <input
              v-model="form.title"
              type="text"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="例如：美食饗宴"
            />
          </div>

          <div class="flex w-full flex-col gap-1 md:flex-1">
            <div class="text-[12px] font-semibold text-slate-700">副標</div>
            <input
              v-model="form.subtitle"
              type="text"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="例如：12個店家"
            />
          </div>
        </div>

        <div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
          <div class="flex w-full flex-col gap-1 md:flex-1">
            <div class="text-[12px] font-semibold text-slate-700">主視覺圖片 URL</div>
            <input
              v-model="form.heroImageUrl"
              type="text"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="貼上圖片網址"
            />
          </div>

          <div class="flex w-full flex-col gap-1 md:w-45">
            <div class="text-[12px] font-semibold text-slate-700">狀態</div>
            <select
              v-model="form.status"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="enabled">啟用</option>
              <option value="disabled">停用</option>
            </select>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl ring-1 ring-slate-100">
          <img
            v-if="form.heroImageUrl"
            :src="form.heroImageUrl"
            alt="hero"
            class="h-52 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div
            v-else
            class="flex h-52 w-full items-center justify-center bg-slate-50 text-[12px] text-slate-500"
          >
            右邊貼上圖片網址後，這裡會即時預覽
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full items-center justify-between gap-3">
        <div class="text-[14px] font-bold text-slate-900">卡片（建議 3 張）</div>
        <div class="text-[12px] text-slate-500">可拖拽排序</div>
      </div>

      <div
        class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex w-full flex-col gap-2 md:flex-row">
          <input
            v-model="cardDraft.name"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:flex-1"
            placeholder="卡片名稱"
          />
          <input
            v-model="cardDraft.category"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:flex-1"
            placeholder="分類文字（例如：美食 ＞ 火鍋）"
          />
        </div>

        <div class="flex w-full flex-col gap-2 md:flex-row">
          <input
            v-model="cardDraft.rating"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:w-40"
            placeholder="評分（例如 4.6）"
          />
          <input
            v-model="cardDraft.distance"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:w-40"
            placeholder="距離（例如 1.2km）"
          />
          <input
            v-model="cardDraft.imageUrl"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:flex-1"
            placeholder="圖片 URL"
          />

          <button
            type="button"
            class="h-10 rounded-xl bg-slate-900 px-4 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            @click="addCard"
          >
            加入卡片
          </button>
        </div>
      </div>

      <draggable
        v-model="form.cards"
        item-key="id"
        handle=".drag-handle"
        class="flex w-full flex-col gap-3"
      >
        <template #item="{ element }">
          <div
            class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <button
              type="button"
              class="drag-handle shrink-0 cursor-grab rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 active:cursor-grabbing"
              aria-label="drag"
            >
              ☰
            </button>

            <div class="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
              <img
                v-if="element.imageUrl"
                :src="element.imageUrl"
                :alt="element.name"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="line-clamp-1 text-[13px] font-bold text-slate-900">
                {{ element.name }}
              </div>
              <div class="line-clamp-1 text-[12px] text-slate-500">
                {{ element.category }}
              </div>
              <div class="flex items-center gap-3 text-[12px] text-slate-600">
                <div class="flex items-center gap-1">
                  <span class="text-orange-500">★</span>
                  <span class="font-semibold">{{ element.rating }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span>◎</span>
                  <span>{{ element.distance }}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
              @click="removeCard(element.id)"
            >
              移除
            </button>
          </div>
        </template>
      </draggable>

      <div
        v-if="!form.cards.length"
        class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-500"
      >
        尚未加入卡片
      </div>
    </div>

    <div
      class="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex w-full items-center justify-between gap-3">
        <div class="text-[14px] font-bold text-slate-900">店家</div>
        <div class="text-[12px] text-slate-500">
          可拖拽排序（你之後也可改成「選店家」流程）
        </div>
      </div>

      <div
        class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex w-full flex-col gap-2 md:flex-row">
          <input
            v-model="storeDraft.name"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:flex-1"
            placeholder="店家名稱"
          />
          <input
            v-model="storeDraft.categoryMain"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:w-40"
            placeholder="主分類"
          />
          <input
            v-model="storeDraft.categorySub"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:w-40"
            placeholder="子分類"
          />
        </div>

        <div class="flex w-full flex-col gap-2 md:flex-row">
          <input
            v-model="storeDraft.rating"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:w-40"
            placeholder="評分"
          />
          <input
            v-model="storeDraft.distance"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:w-40"
            placeholder="距離"
          />
          <input
            v-model="storeDraft.badge"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400 md:flex-1"
            placeholder="徽章 / 優惠文字"
          />
        </div>

        <div class="flex w-full items-center gap-2">
          <input
            v-model="storeDraft.coverUrl"
            type="text"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition focus:border-slate-400"
            placeholder="封面圖片 URL"
          />

          <button
            type="button"
            class="h-10 shrink-0 rounded-xl bg-slate-900 px-4 text-[13px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            @click="addStore"
          >
            加入店家
          </button>
        </div>
      </div>

      <draggable
        v-model="form.stores"
        item-key="id"
        handle=".drag-handle"
        class="flex w-full flex-col gap-2"
      >
        <template #item="{ element }">
          <div
            class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <button
              type="button"
              class="drag-handle shrink-0 cursor-grab rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 active:cursor-grabbing"
              aria-label="drag"
            >
              ☰
            </button>

            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="line-clamp-1 text-[13px] font-bold text-slate-900">
                {{ element.name }}
              </div>
              <div class="line-clamp-1 text-[12px] text-slate-500">
                {{ element.categoryMain }} / {{ element.categorySub }}
              </div>
            </div>

            <div class="shrink-0 text-[12px] font-semibold text-slate-700">
              {{ element.rating }}
            </div>

            <button
              type="button"
              class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
              @click="removeStore(element.id)"
            >
              移除
            </button>
          </div>
        </template>
      </draggable>

      <div
        v-if="!form.stores.length"
        class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-500"
      >
        尚未加入店家
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import draggable from "vuedraggable";
import {
  useAdminThemeStore,
  type AdminTheme,
  type ItemStatus,
  type ThemeCard,
  type ThemeStoreItem,
} from "@/stores/adminThemeStore";

const route = useRoute();
const router = useRouter();
const store = useAdminThemeStore();

const themeId = computed(() => String(route.params.id || ""));
const isCreate = computed(() => route.name === "ThemeCreate" || !themeId.value);

const origin = computed<AdminTheme | null>(() => {
  if (isCreate.value) return null;
  return store.getThemeById(themeId.value);
});

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

const form = reactive<{
  status: ItemStatus;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  cards: ThemeCard[];
  stores: ThemeStoreItem[];
}>({
  status: origin.value?.status || "enabled",
  title: origin.value?.title || "",
  subtitle: origin.value?.subtitle || "",
  heroImageUrl: origin.value?.heroImageUrl || "",
  cards: (origin.value?.cards || []).map((c) => ({ ...c })),
  stores: (origin.value?.stores || []).map((s) => ({ ...s })),
});

const cardDraft = reactive<{
  name: string;
  category: string;
  rating: string;
  distance: string;
  imageUrl: string;
}>({
  name: "",
  category: "",
  rating: "",
  distance: "",
  imageUrl: "",
});

const storeDraft = reactive<{
  name: string;
  categoryMain: string;
  categorySub: string;
  rating: string;
  distance: string;
  badge: string;
  coverUrl: string;
}>({
  name: "",
  categoryMain: "",
  categorySub: "",
  rating: "",
  distance: "",
  badge: "",
  coverUrl: "",
});

function addCard() {
  const name = String(cardDraft.name || "").trim();
  const category = String(cardDraft.category || "").trim();
  const rating = String(cardDraft.rating || "").trim();
  const distance = String(cardDraft.distance || "").trim();
  const imageUrl = String(cardDraft.imageUrl || "").trim();

  if (!name) return;

  const next: ThemeCard = {
    id: uid("card"),
    name,
    category,
    rating,
    distance,
    imageUrl,
  };

  form.cards.push(next);

  cardDraft.name = "";
  cardDraft.category = "";
  cardDraft.rating = "";
  cardDraft.distance = "";
  cardDraft.imageUrl = "";
}

function removeCard(id: string) {
  form.cards = form.cards.filter((c) => c.id !== id);
}

function addStore() {
  const name = String(storeDraft.name || "").trim();
  if (!name) return;

  const next: ThemeStoreItem = {
    id: uid("store"),
    name,
    categoryMain: String(storeDraft.categoryMain || "").trim(),
    categorySub: String(storeDraft.categorySub || "").trim(),
    rating: String(storeDraft.rating || "").trim(),
    distance: String(storeDraft.distance || "").trim(),
    badge: String(storeDraft.badge || "").trim(),
    coverUrl: String(storeDraft.coverUrl || "").trim(),
  };

  form.stores.push(next);

  storeDraft.name = "";
  storeDraft.categoryMain = "";
  storeDraft.categorySub = "";
  storeDraft.rating = "";
  storeDraft.distance = "";
  storeDraft.badge = "";
  storeDraft.coverUrl = "";
}

function removeStore(id: string) {
  form.stores = form.stores.filter((s) => s.id !== id);
}

function cancel() {
  if (isCreate.value) {
    router.push({ name: "ThemeList" });
    return;
  }
  router.push({ name: "ThemeDetail", params: { id: themeId.value } });
}

function save() {
  const title = String(form.title || "").trim();
  if (!title) return;

  const payload = {
    status: form.status,
    title,
    subtitle: String(form.subtitle || "").trim(),
    heroImageUrl: String(form.heroImageUrl || "").trim(),
    cards: form.cards.map((c) => ({ ...c })),
    stores: form.stores.map((s) => ({ ...s })),
  };

  if (isCreate.value) {
    const id = store.createTheme(payload);
    router.push({ name: "ThemeDetail", params: { id } });
    return;
  }

  store.updateTheme(themeId.value, payload);
  router.push({ name: "ThemeDetail", params: { id: themeId.value } });
}
</script>
