import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    mobileSidebarOpen: false,
    sidebarCollapsed: false,
  }),
  actions: {
    toggleMobileSidebar() {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    },
    closeMobileSidebar() {
      this.mobileSidebarOpen = false;
    },
    toggleSidebarCollapsed() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
  },
});
