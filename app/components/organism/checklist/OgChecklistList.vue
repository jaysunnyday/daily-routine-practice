<template>
  <section class="checklist-card">
    <h2 class="checklist-title">今日のToDo</h2>
    <div class="checklist-nav">
      <button type="button" @click="moveDay(-1)">‹</button>
      <span>{{ checklistDate }}</span>
      <button type="button" @click="moveDay(1)">›</button>
    </div>
    <ul class="checklist-list">
      <li
        v-for="item in checklistItems"
        :key="item.id"
        class="checklist-item"
        :class="{ done: item.checked }"
      >
        <input
          type="checkbox"
          class="checklist-check"
          v-model="item.checked"
          @change="onToggle(item)"
        />
        <span class="checklist-tag">{{ item.category }}</span>
        <input
          class="checklist-edit-input"
          v-if="editingId === item.id"
          v-model="editingText"
          @keyup.enter="onSaveEdit(item)"
          @keyup.esc="cancelEdit"
        />
        <span class="checklist-item-content" v-else @click="startEdit(item)">{{
          item.content
        }}</span>
        <button
          type="button"
          class="checklist-delete"
          aria-label="削除"
          @click="onDelete(item)"
        >
          X
        </button>
      </li>
    </ul>

    <form class="checklist-add-form" @submit.prevent="onSave">
      <select class="checklist-select" v-model="category">
        <option disabled value="">カテゴリを選択</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input class="checklist-input" v-model="content" placeholder="やること" />
      <button class="checklist-button" type="submit">追加</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref } from "vue";
import { CATEGORIES } from "~/constants/categories";

const checklistItems = inject<any>("checklistItems");
const checklistDate = inject<Ref<string>>("checklistDate")!;
const category = ref("");
const content = ref("");
const categories = CATEGORIES;

const editingId = ref<number | null>(null);
const editingText = ref("");

onMounted(() => {
  fetchChecklistItems();
});
watch(checklistDate, fetchChecklistItems);

async function fetchChecklistItems() {
  try {
    const result = await $fetch<any[]>(
      `http://localhost:8081/api/checklist?checklistDate=${checklistDate.value}`,
    );
    checklistItems.splice(0, checklistItems.length, ...result);
  } catch (e) {
    console.error("체크리스트 불러오기 실패", e);
  }
}

async function onSave() {
  try {
    await $fetch("http://localhost:8081/api/checklist", {
      method: "POST",
      body: {
        category: category.value,
        content: content.value,
        checked: false,
        checklistDate: checklistDate.value,
      },
    });
    category.value = "";
    content.value = "";
    fetchChecklistItems();
  } catch (e) {
    console.error("체크리스트 등록 실패", e);
  }
}
async function onToggle(item: any) {
  try {
    await $fetch(`http://localhost:8081/api/checklist/${item.id}`, {
      method: "PATCH",
      body: {
        checked: item.checked,
      },
    });
  } catch (e) {
    console.error("체크상태 변경 실패", e);
  }
}

async function onSaveEdit(item: any) {
  try {
    await $fetch(`http://localhost:8081/api/checklist/${item.id}/content`, {
      method: "PATCH",
      body: {
        content: editingText.value,
      },
    });
    editingId.value = null;
    fetchChecklistItems();
  } catch (e) {
    console.error("콘텐츠상태 변경 실패", e);
  }
}

function startEdit(item: any) {
  editingId.value = item.id;
  editingText.value = item.content;
}

function moveDay(diff: number) {
  const d = new Date(checklistDate.value + "T00:00:00");
  d.setDate(d.getDate() + diff);
  checklistDate.value = d.toLocaleDateString("sv-SE");
}

function cancelEdit() {
  editingId.value = null;
}

async function onDelete(item: any) {
  try {
    await $fetch(`http://localhost:8081/api/checklist/${item.id}`, {
      method: "DELETE",
    });
    fetchChecklistItems();
  } catch (e) {
    console.error("체크리스트 삭제 실패", e);
  }
}
</script>
