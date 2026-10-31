<template>
  <div class="app-layout">
    <NuxtRouteAnnouncer />
    <OgNavBar />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>
<script setup lang="ts">
import OgNavBar from '~/components/organism/common/OgNavBar.vue'
</script>