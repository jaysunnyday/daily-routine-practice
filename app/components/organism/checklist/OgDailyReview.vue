<template>
    <section class="review-card">
        <h2 class="review-title">コメント</h2>
        <textarea class="review-textarea" v-model="content" rows="5" placeholder="今日の振り返り"></textarea>
        <button type="button" class="review-button" @click="onSave">保存</button>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const content = ref('')
const today = new Date().toLocaleDateString('sv-SE')   // "2026-10-06" 형태

onMounted(() => {
    fetchReview()
})

async function fetchReview() {
    try{
        const result = await $fetch<any>(`http://localhost:8081/api/review?date=${today}`)
        content.value = result.content ?? ''
    }
    catch(e){
        console.log('fetchReview실패',e)
    }
}

async function onSave() {
        try {
        await $fetch('http://localhost:8081/api/review', {
            method: 'PUT',
            body: {
                reviewDate: today,
                content: content.value
            }
        })
    } catch (e) {
        console.error('오늘의 평가 저장 실패', e)
    }
}
</script>
