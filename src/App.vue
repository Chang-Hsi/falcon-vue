<template>
  <component :is="layoutComponent" />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import LoginLayout from "@/layouts/LoginLayout.vue";

const route = useRoute();

const layoutComponent = computed(() => {
  const key = route?.meta?.layout || "default";
  if (key === "login") return LoginLayout;
  return DefaultLayout;
});
</script>
