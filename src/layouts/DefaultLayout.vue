<template>
  <div class="drawer lg:drawer-open">
    <input
      v-model="ui.mobileSidebarOpen"
      id="app-drawer"
      type="checkbox"
      class="drawer-toggle"
    />

    <div class="drawer-content flex min-h-screen flex-col bg-[#f5f7fb]">
      <Header />

      <main class="flex min-h-0 flex-1 flex-col px-5 py-2">
        <router-view />
      </main>
    </div>

    <div class="drawer-side">
      <label
        for="app-drawer"
        class="drawer-overlay bg-black/30"
        @click="ui.closeMobileSidebar()"
      ></label>
      <Sidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import Header from "@/components/layouts/Header.vue";
import Sidebar from "@/components/layouts/Sidebar.vue";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();

watchEffect(() => {
  if (typeof window === "undefined") return;
  document.body.style.overflow = ui.mobileSidebarOpen ? "hidden" : "";
});
</script>
