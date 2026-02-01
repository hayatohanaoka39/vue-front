<template>
  <div class="container">
    <h2>画像候補一覧</h2>

    <div v-if="loading" class="loading">
      画像を検索中です…
    </div>

    <div v-else>
      <div v-if="images.length === 0">
        画像が見つかりませんでした。
        <button @click="goBack">戻る</button>
      </div>

      <div v-else class="image-grid">
        <img
          v-for="(img, i) in images"
          :key="i"
          :src="img"
          class="candidate"
          @click="selectImage(img)"
          @error="images.splice(i, 1)"
        />
      </div>

      <button class="back-btn" @click="goBack">戻る</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const images = ref([])
const loading = ref(true)

onMounted(async () => {
  const title = route.query.title
  if (!title) {
    loading.value = false
    return
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/search-images?title=${encodeURIComponent(title)}`
    )
    images.value = await res.json()
  } catch (e) {
    console.error("画像検索エラー:", e)
  }

  loading.value = false
})

function selectImage(img) {
  // CandidateList で保存した作品データを取得
  const work = JSON.parse(sessionStorage.getItem('selectedWork') || '{}')

  // 画像URLを上書き
  work.image_url = img

  // 作品データを再保存
  sessionStorage.setItem('selectedWork', JSON.stringify(work))

  // 登録画面へ
  router.push({
    path: '/register',
    query: { selected: 1 }
  })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.loading {
  font-size: 18px;
  margin-top: 20px;
}

.image-grid {
  display: grid;
  gap: 8px;
  margin-top: 20px;
}

.candidate {
  width: 100%;
  aspect-ratio: 2 / 3; /* ← 縦長に変更 */
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.candidate:hover {
  transform: scale(1.05);
}

.back-btn {
  margin-top: 20px;
  padding: 14px 20px;   /* ← ボタンを大きく */
  font-size: 18px;      /* ← 文字も大きく */
  font-weight: 600;     /* ← 見やすく太字に */
  background: #ccc;
  border: none;
  cursor: pointer;
  border-radius: 8px;   /* ← 少し丸くして可読性UP */
}

.back-btn:hover {
  background: #b5b5b5;
}

/* PC（幅1024px以上）→ 5列 */ 
@media (min-width: 1024px) { 
  .image-grid { 
    grid-template-columns: repeat(5, 1fr); 
  } 
}

/* タブレット（幅768px以上1024px未満）→ 4列 */ 
@media (min-width: 768px) and (max-width: 1023px) { 
  .image-grid { 
    grid-template-columns: repeat(4, 1fr); 
  } 
}


/* スマホ（幅768px未満）→ 3列 */
@media (max-width: 767px) { 
  .image-grid { 
    grid-template-columns: repeat(2, 1fr); 
  } 
}
</style>
