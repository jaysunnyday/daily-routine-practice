<template>
  <section class="timechart-card">
    <div class="timechart-nav">
      <button type="button" @click="moveDay(-1)">‹</button>
      <span>{{ blockDate }}</span>
      <button type="button" @click="moveDay(1)">›</button>
    </div>
    <div class="timechart-box">
      <Chart type="doughnut" :data="chartData" :options="chartOptions" />
      <span
        v-for="m in hourMarks"
        :key="m.hour"
        class="timechart-hour"
        :style="{ left: m.left, top: m.top }"
        >{{ m.hour }}</span
      >
      <span
        v-for="l in blockLabels"
        :key="l.id"
        class="timechart-label"
        :style="{ left: l.left, top: l.top }"
        >{{ l.text }}</span
      >
    </div>
    <ul class="timechart-list">
      <li v-for="b in blocks" :key="b.id">
        {{ toTimeText(b.startMinute) }} ～ {{ toTimeText(b.endMinute) }}　{{
          b.category
        }}
      </li>
    </ul>
    <p v-if="clickedStart !== null" class="timechart-hint">
      開始 {{ toTimeText(clickedStart) }} ― 終了の位置をクリックしてください
      <button type="button" @click="clickedStart = null">取消</button>
    </p>
    <form class="timechart-form" @submit.prevent="onSave">
      <select v-model="startMinute">
        <option v-for="m in timeOptions" :key="m" :value="m">
          {{ toTimeText(m) }}
        </option>
      </select>
      ～
      <select v-model="endMinute">
        <option v-for="m in timeOptions" :key="m" :value="m">
          {{ toTimeText(m) }}
        </option>
      </select>
      <select v-model="category">
        <option disabled value="">カテゴリを選択</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <button type="submit">追加</button>
    </form>
    <p v-if="errorMessage" class="timechart-error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { CATEGORY_COLORS } from "~/constants/categories";
import { CATEGORIES } from "~/constants/categories";

const blockDate = ref(new Date().toLocaleDateString("sv-SE"));
const blocks = ref<any[]>([]);
const chartData = computed(() => ({
  labels: slices.value.map((s) => s.label),
  datasets: [
    {
      data: slices.value.map((s) => s.minutes),
      backgroundColor: slices.value.map((s) => s.color),
    },
  ],
}));
const chartOptions = {
  cutout: "10%",
  plugins: { legend: { display: false } },
  onClick: (event: any, _elements: any, chart: any) => {
    onChartClick(clickToMinute(event.x, event.y, chart));
  },
};

const startMinute = ref(540); // 폼에서 고른 시작 (처음엔 9:00)

const clickedStart = ref<number | null>(null); // 첫 클릭한 분 (아직 안 눌렀으면 null)

const endMinute = ref(600); // 폼에서 고른 끝 (처음엔 10:00)
const category = ref(""); // 고른 카테고리
const categories = CATEGORIES;

const errorMessage = ref("");

const slices = computed(() => {
  const result: any[] = []; // 만들 조각 목록
  let prevEnd = 0; // 직전 블록이 끝난 분 (처음엔 0시)
  blocks.value.forEach((b) => {
    if (b.startMinute > prevEnd) {
      result.push({
        minutes: b.startMinute - prevEnd,
        color: "#eee",
        label: "空き",
      });
    }
    result.push({
      minutes: b.endMinute - b.startMinute,
      color: CATEGORY_COLORS[b.category] ?? "#e0e0e0",
      label: b.category,
    });
    prevEnd = b.endMinute;
  });

  if (prevEnd < 1440) {
    result.push({ minutes: 1440 - prevEnd, color: "#eee", label: "空き" });
  }

  // ④ 마지막 블록 뒤 ~ 24:00(1440)까지 빈 시간 조각
  return result;
});

const timeOptions: number[] = [];
for (let m = 0; m <= 1440; m += 15) {
  timeOptions.push(m);
}

const blockLabels = computed(() => {
  return blocks.value
    .filter((b) => b.endMinute - b.startMinute >= 45) // 너무 짧은 블록은 글자 생략
    .map((b) => {
      const mid = (b.startMinute + b.endMinute) / 2; // 블록 가운데 시각 (분)
      const angle = (mid / 1440) * 2 * Math.PI; // 분 → 각도
      const r = 30; // 중심에서의 거리 (%)
      return {
        id: b.id,
        text: b.category,
        left: 50 + r * Math.sin(angle) + "%",
        top: 50 - r * Math.cos(angle) + "%",
      };
    });
});

onMounted(fetchBlocks);
watch(blockDate, fetchBlocks);

async function fetchBlocks() {
  try {
    blocks.value = await $fetch<any[]>(
      `http://localhost:8081/api/timeblock?blockDate=${blockDate.value}`,
    );
  } catch (e) {
    console.error("블럭 불러오기 실패", e);
    blocks.value = [];
  }
}

async function onSave() {
  errorMessage.value = ""; // 이전 에러를 먼저 지움
  try {
    await $fetch("http://localhost:8081/api/timeblock", {
      method: "POST",
      body: {
        blockDate: blockDate.value,
        startMinute: startMinute.value,
        endMinute: endMinute.value,
        category: category.value,
      },
    });
    await fetchBlocks(); // 저장 후 목록을 다시 불러와서 도넛 갱신
  } catch (e) {
    errorMessage.value = (e as any).data ?? "保存に失敗しました";
  }
}

function toTimeText(minute: number) {
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  return `${hour}:${String(min).padStart(2, "0")}`;
}

function moveDay(diff: number) {
  const d = new Date(blockDate.value + "T00:00:00"); // '2026-10-27' → 그날 0시
  d.setDate(d.getDate() + diff); // diff일 만큼 더하거나 뺌
  blockDate.value = d.toLocaleDateString("sv-SE"); // 다시 'YYYY-MM-DD' 글자로
  errorMessage.value = ""; // 이전 날의 에러는 지움
}

function clickToMinute(x: number, y: number, chart: any) {
  const area = chart.chartArea; // 도넛이 그려진 영역
  const cx = (area.left + area.right) / 2; // 중심의 x
  const cy = (area.top + area.bottom) / 2; // 중심의 y
  const dx = x - cx; // 중심에서 클릭까지 가로 거리
  const dy = y - cy; // 세로 거리
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI; // 각도 (12시 = 0도, 시계 방향이 +)
  if (angle < 0) angle += 360; // 음수면 360을 더해 0~360으로
  const minute = (angle / 360) * 1440; // 각도 → 분
  return Math.round(minute / 15) * 15; // 15분 단위로 반올림
}

function onChartClick(minute: number) {
  if (clickedStart.value === null) {
    clickedStart.value = minute; // 첫 클릭: 시작 기억
  } else {
    const a = clickedStart.value;
    startMinute.value = Math.min(a, minute); // 작은 쪽이 시작
    endMinute.value = Math.max(a, minute); // 큰 쪽이 끝
    clickedStart.value = null; // 다음 입력을 위해 비움
  }
}

const hourMarks: { hour: number; left: string; top: string }[] = [];
for (let h = 0; h < 24; h++) {
  const angle = (h / 24) * 2 * Math.PI; // 0시 = 12시 방향, 시계 방향 (라디안 단위)
  const r = 44; // 중심에서 얼마나 떨어뜨릴지 (박스 너비의 %)
  hourMarks.push({
    hour: h,
    left: 50 + r * Math.sin(angle) + "%", // 가로 위치
    top: 50 - r * Math.cos(angle) + "%", // 세로 위치 (화면은 아래가 +라서 빼기)
  });
}
</script>
