<template>
    <section class="calendar-card">
        <div class="calendar-header">
            <button type="button" class="calendar-nav-button" @click="moveMonth(-1)">‹</button>
            <h2 class="calendar-title">{{ year }}年{{month + 1}}月</h2>
            <button type="button" class="calendar-nav-button" @click="moveMonth(1)">›</button>
            </div>
            <div class="calendar-weekdays">
                <span v-for="w in weekdays" :key="w" class="calendar-weekday">{{ w }}</span>
            </div>

        <div class="calendar-days">
            <div v-for="(day, index) in days" :key="index" class="calendar-day" :class="{empty: day === null, today: isToday(day), selected: day !== null && selectedDate === dateString(day)}" @click="selectDay(day)">
                <span class="calendar-day-number">{{ day }}</span>
                <div class="calendar-stickers">
                    <span v-for="s in stickersOf(day)" :key="s.id" class="calendar-sticker" @click.stop="onDelete(s.id)">{{ emojiOf(s.stickerKey)}}</span>
                </div>
            </div>
        </div>

        <form v-if="selectedDate" class="calendar-palette" @submit.prevent="onSave">
            <span>{{ selectedDate }}</span>
            <select v-model="selectedKey" class="calendar-palette-select">
                <option value="">...</option>
                <option v-for="(emoji, key) in stickerEmojis" :key="key" :value="key">{{ emoji }}</option>
            </select>
            <button type="submit" class="calendar-palette-button">貼る</button>
            <button type="button" class="calendar-palette-button" @click="selectedDate=null">閉じる</button>
        </form>
        <p v-if="errorMessage" class="calendar-error">{{ errorMessage }}</p>
    </section>
</template>
<script setup lang="ts">
    const year = ref(new Date().getFullYear())
    const month = ref(new Date().getMonth())
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']

    const selectedDate = ref<string|null>(null)
    const selectedKey = ref('')

    const stickers=ref<any[]>([])
    const stickerEmojis:Record<string,string>={
        happy: '😊', soso: '😐', sad: '😢', sleepy: '😴',
        perfect: '🌟', good: '👍', try: '🌱',
        heart: '💗', flower: '🌸', muscle: '💪'
    }

    const days =computed<(number | null)[]>(()=>{
        const firstDay = new Date(year.value, month.value, 1).getDay()
        const lastDate = new Date(year.value, month.value +1, 0).getDate()

        return [...Array(firstDay).fill(null),
            ...Array.from({length:lastDate},(_,i)=>i+1)
        ]
    })

    const errorMessage = ref('')

    onMounted(fetchStickers)
    watch([year, month], fetchStickers)

    function moveMonth(delta:number){
        month.value += delta
        if(month.value<0) {
            month.value = 11
            year.value--
        }else if(month.value >11){
            month.value = 0
            year.value++
        }
    }

    function isToday(day: number|null){
        const now = new Date()
        return day === now.getDate()
        && month.value === now.getMonth()
        && year.value === now.getFullYear()
    }

    function selectDay(day: number|null){
        if(day===null) return
        errorMessage.value = ''
        selectedDate.value=dateString(day)
    }
    
    function emojiOf(key:string){
        return stickerEmojis[key] ?? '❔'
    }

    function dateString(day:number){
        return `${year.value}-${String(month.value+1).padStart(2,'0')}-${String(day).padStart(2, '0')}`
    }

    function stickersOf(day:number|null){
        if(day === null)return []
        return stickers.value.filter(s=>s.stickerDate === dateString(day))
    }

    async function fetchStickers(){
        try{
            stickers.value = await $fetch<any[]>(`http://localhost:8081/api/sticker?year=${year.value}&month=${month.value+1}`)
         }catch(e){
            console.error('스티커 불러오기 실패', e)
        }
    }

    async function onSave(){
        errorMessage.value = ''
        try{
            await $fetch('http://localhost:8081/api/sticker',{
                method:'POST',
                body:{
                    stickerDate: selectedDate.value,
                    stickerKey: selectedKey.value
                }
            })
            await fetchStickers()
            selectedDate.value = null
            selectedKey.value = ''
        }catch(e){
            errorMessage.value = (e as any).data ?? '登録に失敗しました'
        }
    }

    async function onDelete(id:number){
        errorMessage.value = ''
        try{
            await $fetch(`http://localhost:8081/api/sticker/${id}`,{
            method: 'DELETE'
            })
            await fetchStickers()
        }catch (e){
            errorMessage.value = '削除に失敗しました'
        }

    }
</script>