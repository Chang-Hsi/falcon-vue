<template>
  <aside
    class="flex h-full flex-col bg-white transition-[width] duration-200 ease-out"
    :class="ui.sidebarCollapsed ? 'w-21' : 'w-67.5'"
  >
    <div class="flex h-16 items-center gap-1 border-b border-slate-50 px-5">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
        <span class="text-lg font-extrabold text-slate-700">P</span>
      </div>

      <div v-if="!ui.sidebarCollapsed" class="flex leading-none">
        <img src="../../assets/logo.png" alt="logo" class="h-12" />
      </div>
    </div>

    <nav class="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-3 py-4">
      <div v-for="g in menuGroups" :key="g.key" class="flex flex-col gap-2">
        <div
          v-if="!ui.sidebarCollapsed"
          class="px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400"
        >
          {{ g.title }}
        </div>

        <RouterLink
          v-for="item in g.items"
          :key="item.path"
          :to="item.path"
          class="flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          :class="[
            ui.sidebarCollapsed ? 'justify-center' : 'gap-3',
            isActive(item.path) ? 'bg-blue-50 text-blue-700' : '',
          ]"
          @click="ui.closeMobileSidebar()"
          :title="ui.sidebarCollapsed ? item.label : ''"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span v-if="!ui.sidebarCollapsed" class="min-w-0 truncate">{{
            item.label
          }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="border-t border-slate-50 p-4">
      <div
        class="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
        :class="ui.sidebarCollapsed ? 'justify-center' : ''"
      >
        <div v-if="!ui.sidebarCollapsed" class="flex min-w-0 flex-1 flex-col">
          <div class="truncate text-sm font-extrabold text-slate-900">
            {{ authStore.userName }}
          </div>
        </div>

        <button
          v-if="!ui.sidebarCollapsed"
          type="button"
          class="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          @click="onLogout()"
        >
          <ArrowRightOnRectangleIcon class="h-4 w-4" />
          登出
        </button>

        <button
          v-else
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          @click="onLogout()"
          title="登出"
        >
          <ArrowRightOnRectangleIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/authStore";
import type { Component } from "vue";

import {
  Squares2X2Icon,
  ShoppingCartIcon,
  CubeIcon,
  TagIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  BanknotesIcon,
  LifebuoyIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const ui = useUiStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

type SidebarGroup =
  | "dashboard"
  | "catalog"
  | "content"
  | "orders"
  | "finance"
  | "support"
  | "users"
  | "system";

type MenuItem = {
  path: string;
  label: string;
  order: number;
  group: SidebarGroup;
  icon: Component;
};

const groupTitleMap: Record<SidebarGroup, string> = {
  dashboard: "Dashboard",
  catalog: "管理",
  content: "內容",
  orders: "訂單",
  finance: "金流/對帳",
  support: "客服/工單",
  users: "會員管理",
  system: "權限設定",
};

function pickIconByRoutePath(path: string): Component {
  if (path.startsWith("/dashboard")) return Squares2X2Icon;

  if (path.startsWith("/brands")) return CubeIcon;
  if (path.startsWith("/tickets")) return TagIcon;
  if (path.startsWith("/deals")) return ShoppingCartIcon;
  if (path.startsWith("/categories")) return RectangleGroupIcon;
  if (path.startsWith("/themes") || path.startsWith("/banners"))
    return RectangleGroupIcon;

  if (path.startsWith("/search-management")) return MagnifyingGlassIcon;

  if (path.startsWith("/orders")) return ClipboardDocumentListIcon;
  if (path.startsWith("/fulfillment")) return ClipboardDocumentListIcon;

  if (path.startsWith("/payments/settings")) return CreditCardIcon;
  if (path.startsWith("/reconciliation") || path.startsWith("/invoices"))
    return BanknotesIcon;

  if (path.startsWith("/support")) return LifebuoyIcon;

  if (path.startsWith("/members")) return UsersIcon;

  if (path.startsWith("/system")) return Cog6ToothIcon;

  return UserGroupIcon;
}

const menuGroups = computed(() => {
  const all = router.getRoutes();

  const items: MenuItem[] = all
    .filter((r) => {
      const m: any = r.meta;
      if (
        !m?.sidebar?.group ||
        !m?.sidebar?.label ||
        typeof m?.sidebar?.order !== "number"
      )
        return false;

      const p = r.path || "";
      const isDetail = p.includes("/:id");
      const isCreate = p.endsWith("/create");
      const isEdit = p.endsWith("/edit") || p.includes("/:id/edit");

      if (isDetail || isCreate || isEdit) return false;

      return true;
    })
    .map((r) => {
      const m: any = r.meta;
      const group = m.sidebar.group as SidebarGroup;
      const label = String(m.sidebar.label || "");
      const order = Number(m.sidebar.order || 999);
      const path = r.path;

      return {
        path,
        label,
        order,
        group,
        icon: pickIconByRoutePath(path),
      };
    })
    .sort((a, b) => a.order - b.order);

  const groupMap = new Map<
    string,
    { key: SidebarGroup; title: string; items: MenuItem[]; order: number }
  >();

  for (const it of items) {
    const key = it.group;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        title: groupTitleMap[key],
        items: [],
        order: it.order,
      });
    }
    const g = groupMap.get(key)!;
    g.items.push(it);
    g.order = Math.min(g.order, it.order);
  }

  return Array.from(groupMap.values())
    .sort((a, b) => a.order - b.order)
    .map((g) => ({
      key: g.key,
      title: g.title,
      items: g.items.sort((a, b) => a.order - b.order),
    }));
});

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + "/");
}

// 你原本應該已經有 ui、router
// import { useRouter, useRoute } from "vue-router";

function clearAuth() {
  try {
    localStorage.removeItem("admin_auth");
  } catch {}
}

async function onLogout() {
  console.log("[Sidebar] logout clicked");

  // 1) 清登入狀態
  clearAuth();

  // 2) 關閉手機側欄（保留你原本的）
  ui.closeMobileSidebar();

  // ✅ 如果你不想帶 redirect，直接 router.replace("/signin") 就好
  const currentPath =
    typeof router?.currentRoute?.value?.fullPath === "string"
      ? router.currentRoute.value.fullPath
      : "";

  await router.replace({
    path: "/signin",
    query: currentPath ? { redirect: currentPath } : {},
  });
}
</script>
