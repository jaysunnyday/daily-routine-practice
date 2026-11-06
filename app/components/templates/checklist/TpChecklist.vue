<template>
  <div class="checklist-page">
    <OgChecklistList />
    <OgDailyReview />
  </div>
</template>

<script setup lang="ts">
import OgChecklistList from "~/components/organism/checklist/OgChecklistList.vue";
import OgDailyReview from "~/components/organism/checklist/OgDailyReview.vue";

const route = useRoute();
const checklistDate = ref(
  (route.query.checklistDate as string) ??
    new Date().toLocaleDateString("sv-SE"),
);

provide("checklistDate", checklistDate);
</script>
