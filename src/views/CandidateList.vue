<template>
  <div>
    <h2>候補一覧</h2>


	<!-- 候補がない場合のメッセージ + 戻るボタン -->
    <div v-if="candidates.length === 0">
      	候補がありません。検索画面に戻ってください。<br />
      	<button class="back-btn" @click="goBackToRegister">登録画面に戻る</button>
    </div>

    <div v-else>
      <div v-for="(work, idx) in candidates" :key="idx" class="work-card">
        <img :src="work.image_url" v-if="work.image_url" />
        <h4>{{ work.title }}</h4>
        <p>著者: {{ work.author }}</p>
        <p>出版社/制作会社: {{ work.publisher }}</p>
        <p>{{ work.summary }}</p>
		<div class="button-row">
        	<button @click="selectCandidate(work)">この作品を選択</button>
			<button class="cancel-btn" @click="goBackToRegister">キャンセル</button>
      	</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

let candidates = []
try {
  candidates = route.query.results ? JSON.parse(route.query.results) : []
} catch (e) {
  console.error("候補一覧のパースエラー:", e)
}

// CandidateList.vue
function selectCandidate(work) {
  const safeWork = { 
    title: work.title, 
    work_type: work.work_type, 
    summary: work.summary || '', 
    image_url: work.image_url || '', 
    author: work.author || '', 
    publisher: work.publisher || '', 
  }

  sessionStorage.setItem('selectedWork', JSON.stringify(safeWork))

  router.push({
    path: '/select-image',
    query: { title: work.title }
  })
}

// 候補がなかった場合に登録画面へ戻る
function goBackToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.back-btn {
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 16px;
  background: #ccc;
  border: none;
  cursor: pointer;
}
.back-btn:hover {
  background: #bbb;
}

.button-row {
  margin-top: 12px;
  display: flex;
  gap: 20px; /* ← ボタン間の余白を広げる */
}

.action-btn {
  flex: 1; /* ← 横幅を揃える */
  padding: 10px 16px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  text-align: center;
}

.action-btn:hover {
  opacity: 0.9;
}

.cancel-btn {
  background: #f2f2f2;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.action-btn:not(.cancel-btn) {
  background: #ccc;
}

.action-btn:not(.cancel-btn):hover {
  background: #bbb;
}

</style>