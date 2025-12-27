<template>
  <header
    class="sticky top-0 z-30 flex h-16 w-full items-center border-b border-slate-50 bg-white"
  >
    <div class="flex w-full items-center justify-between gap-4 px-5">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          @click="ui.toggleMobileSidebar()"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>

        <button
          type="button"
          class="hidden h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:flex"
          @click="ui.toggleSidebarCollapsed()"
          :title="ui.sidebarCollapsed ? '展開側邊欄' : '收合側邊欄'"
        >
          <Bars3Icon v-if="ui.sidebarCollapsed" class="h-6 w-6" />
          <Bars3Icon v-else class="h-6 w-6" />
        </button>

        <div class="hidden min-w-0 flex-1 lg:flex">
          <div
            class="flex w-full max-w-140 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2"
          >
            <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
            <input
              v-model="keyword"
              type="text"
              class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          title="Notifications"
        >
          <BellIcon class="h-6 w-6" />
          <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>

        <div
          class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1"
        >
          <img
            :src="authStore.userAvatarUrl"
            alt="avatar"
            class="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div class="hidden pr-2 sm:flex sm:flex-col sm:leading-tight">
            <div class="text-sm font-semibold text-slate-700">
              {{ authStore.userName }}
            </div>
            <div class="text-[11px] font-medium text-slate-500">
              {{ authStore.userRoleTitle }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/authStore";
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const ui = useUiStore();
const authStore = useAuthStore();

const keyword = ref<string>("");
</script>
