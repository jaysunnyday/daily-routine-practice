<template>
    <section class="checklist-card">
      <h2 class="checklist-title">오늘의 할 일</h2>

      <ul class="checklist-list">
        <li v-for="item in checklistItems" :key="item.id"
            class="checklist-item" :class="{ done: item.checked }">
          <input type="checkbox" class="checklist-check"
                 v-model="item.checked" @change="onToggle(item)" />
          <span class="checklist-tag">{{ item.category }}</span>
          <span class="checklist-item-content">{{ item.content }}</span>
          <button type="button" class="checklist-delete" aria-label="削除" @click="onDelete(item)">X</button>
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
import { onMounted } from 'vue'
import {ref} from 'vue'
import { CATEGORIES } from '~/constants/categories'

const checklistItems = inject<any>('checklistItems')
const category = ref('')
const content = ref('')
const categories = CATEGORIES

onMounted(()=>{
    fetchChecklistItems()
})

async function fetchChecklistItems(){
    try{
        const result = await $fetch<any[]>('http://localhost:8081/api/checklist')
        checklistItems.splice(0, checklistItems.length, ...result)
    }catch(e){
        console.error('체크리스트 불러오기 실패', e)
    }
}

async function onSave(){
    try{
        await $fetch('http://localhost:8081/api/checklist', {
            method:'POST',
            body:{
                category: category.value,
                content: content.value,
                checked: false,
                checklistDate: new Date().toLocaleDateString('sv-SE')
            }
        })
        category.value=''
        content.value=''
        fetchChecklistItems()

    }
    catch(e){
        console.error('체크리스트 등록 실패', e)
    }
}
async function onToggle(item:any){
    try{
        await $fetch(`http://localhost:8081/api/checklist/${item.id}`,{
            method:'PATCH',
            body:{
                checked:item.checked
            }
        })
    }catch(e){
        console.error('체크상태 변경 실패', e)
    }
}
async function onDelete(item:any){
    try{
        await $fetch(`http://localhost:8081/api/checklist/${item.id}`,{
            method: 'DELETE'
        })
        fetchChecklistItems()
    }
    catch(e){
        console.error('체크리스트 삭제 실패',e)
    }
}
</script>
