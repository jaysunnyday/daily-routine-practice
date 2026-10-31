<template>
    <TpChecklist/>
</template>
<script setup lang="ts">
import TpChecklist from '~/components/templates/checklist/TpChecklist.vue';

const checklistItems = reactive<any[]>([])

provide('checklistItems', checklistItems)

</script>