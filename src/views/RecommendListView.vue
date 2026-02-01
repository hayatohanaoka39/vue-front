<template>
  <div class="recommend-listview">
    <div class="recommend-listview">
      <h1>おすすめ作品一覧</h1>

      <div v-if="loading" class="loading">
        候補を検索中です…
      </div>

      <div v-else>
      <!-- メッセージ表示 -->
        <div 
          v-if="recommendedItems.length > 0 && recommendedItems[0].message"
          class="no-result"
        >
          {{ recommendedItems[0].message }}
        </div>

        <!-- カード一覧 -->
        <div v-else class="card-list">
          <div
            v-for="item in recommendedItems"
            :key="item.work_id"
            class="card-wrapper"
          >

            <!-- 上段：カード + 理由（横並び） -->
            <div class="top-row">

              <!-- 左：作品カード -->
              <div class="card">
                <div class="card-image">
                  <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
                  <div v-else class="no-image">イメージがありません</div>
                </div>

                <div class="card-content">
                  <div class="card-info">
                    <h3 class="title">{{ item.title }}</h3>
                  </div>
                </div>
              </div>

              <!-- 右：推薦理由 -->
              <div class="reason-box">
                <h4>おすすめ理由</h4>
                <p>{{ item.reason }}</p>
              </div>

            </div>

            <div class="button-row">
              <button class="button-base select-button" @click="selectWork(item)">
                この作品を登録する
              </button>

              <button class="button-base back-button" @click="goBack">
                戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> 
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const recommendedItems = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true

  let answers = []
  let genres = []

  try { answers = JSON.parse(route.query.answers || "[]") } catch {}
  try { genres = JSON.parse(route.query.genres || "[]") } catch {}

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/recommendations`,
    {
    user_id: 123,
    answers,
    genres
  })

    recommendedItems.value = res.data

  } catch (err) {
    console.error("推薦APIエラー:", err)

    // ★ Flask が 500 を返したとき Vue 側で安全に処理
    recommendedItems.value = [{
      message: "現在AIが混雑しています。時間をおいて再度お試しください。"
    }]
  }

  loading.value = false
})

async function selectWork(item) {
  // 1. DB から作品情報を取得
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/${item.work_id}`
  )

  const work = res.data[0]

  // 2. 取得した作品情報を Register.vue に渡す
  router.push({
    path: '/register',
    query: {
      work: JSON.stringify({
        title: work.title,
        work_type: work.work_type,
        summary: work.summary,
        image_url: work.image_url,
        author: work.author,
        publisher: work.publisher
      })
    }
  })
}

function goBack() {
  router.push('/recommend')   // ← あなたの「おすすめ紹介画面」のパスに合わせて変更
}

</script>

<style scoped>
.recommend-listview {
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;
}

.recommend-listview h1 {
  text-align: center;
  margin-bottom: 20px;
}


.list-container {
  max-width: 900px;   /* ← おすすめ一覧の幅を制限（お好みで調整） */
  margin: 0 auto;     /* ← 中央寄せ */
  padding: 20px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-wrapper {
  display: flex;              /* ← 横並びにする */
  flex-direction: column;
  gap: 12px;                  /* カードと推薦理由の間の余白 */
  margin-bottom: 30px;
}

/* 上段（カード + 理由）を横並びにする */ 
.top-row { 
  display: flex; 
  gap: 20px; 
  align-items: stretch;
  width: 1100px;
  margin: 0 auto;
}

/* 左側のカード（漫画一覧と同じ） */
.card {
  display: flex;
  align-items: center;
  width: 460px;               /* ← 推薦理由と並べるため固定幅にする */
  border: 1px solid #ccc;
  padding: 14px;
  border-radius: 10px;
  background: #fafafa;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-image {
  width: 150px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 6px;
  margin-right: 18px;
}

.card-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
}

.genre-tag {
  display: inline-block;
  background: #dfe8ff;
  color: #2c4b9c;
  padding: 5px 10px;
  border-radius: 6px;
  margin-right: 6px;
  font-size: 13px;
}

/* 右側の推薦理由ボックス */
.reason-box {
  width: 700px;
  min-height: 180px;
  padding: 16px;
  background: #ffffff;
  border-left: 4px solid #4a90e2;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reason-box h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
}

.reason-box p {
  margin: 0;
  font-size: 19px;
  line-height: 1.6;
  color: #333;
}

.reason {
  font-size: 18px;
  color: #444;
}

.no-result {
  padding: 20px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  color: #856404;
  font-size: 16px;
  margin-top: 20px;
}

.button-base {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: 0.2s;
  color: white;
}

.select-button { 
  background: #4a90e2; 
}

.select-button:hover {
  background: #357ac8;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.back-button { 
  background: #777; 
}

.back-button:hover {
  background: #555;
}

@media (max-width: 600px) {

  /* カード全体の左右余白を広げる */
  .card-wrapper {
    width: 100%;
    padding: 0;
    margin: 0 0 20px 0;
    box-sizing: border-box;
  }

  .top-row {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
  }

  /* カードの横幅を広げる（写真サイズはそのまま） */
  .card {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 20px; /* ← 横の余白を広げる */
    padding: 14px;
    align-items: flex-start;
    border: 1px solid #ccc;
    border-radius: 10px;
    background: #fafafa;
  }

  /* 写真サイズはそのまま！ */
  .card-image {
    width: 125px;
    height: 150px;
    flex-shrink: 0;
  }

  .card-image img,
  .card-image .no-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* タイトル部分の横幅が広がる */
  .card-info .title {
    font-size: 17px;
    line-height: 1.35;
    overflow: hidden;
  }

  /* 理由ボックスも横方向を広げる（縦はそのまま） */
  .reason-box {
    width: 100%;
    box-sizing: border-box;
    padding: 14px;
    background: #f3f3f3;
    border-radius: 10px;
    border: 1px solid #ddd;
    word-break: break-word;
  }

  .reason-box h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }

  .reason-box p {
    font-size: 15px;
    line-height: 1.5;
    margin: 0;
  }

  /* ボタンはそのまま */
  .button-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 14px;
    width: 100%;
  }

  .button-base {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }
}

</style>