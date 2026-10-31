<template>
  <div style="padding: 24px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <Checkbox v-model="checked" binary />
    <Tag value="日本語の勉強" />
    <Select v-model="picked" :options="['読書', '運動', '洗濯']" placeholder="カテゴリを選択" />
    <InputText v-model="text" placeholder="やること" />
    <Button label="追加" />
  </div>
</template>

<script setup lang="ts">
const checked = ref(false)
const picked = ref('')
const text = ref('')
</script>