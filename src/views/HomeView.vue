<template>
  <div class="home">
    <Header title="ホーム">
      <template #right>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="作品を検索"
          class="search-bar"
        />
        <button @click="goRegister" class="register-btn">新規登録</button>
      </template>

      <template #filters>
        <!-- 表示モード切り替え -->
        <button 
          @click="switchView('all')" 
          :class="{ active: currentView === 'all' }"
        >全表示</button>

        <button 
          @click="switchView('watching')" 
          :class="{ active: currentView === 'watching' }"
        >視聴中</button>

        <button 
          @click="switchView('manga')" 
          :class="{ active: currentView === 'manga' }"
        >漫画作品</button>

        <button 
          @click="switchView('anime')" 
          :class="{ active: currentView === 'anime' }"
        >アニメ作品</button>
      </template>
    </Header>

    <div class="home-filters">
              <button 
          @click="switchView('all')" 
          :class="{ active: currentView === 'all' }"
        >全表示</button>

        <button 
          @click="switchView('watching')" 
          :class="{ active: currentView === 'watching' }"
        >視聴中</button>

        <button 
          @click="switchView('manga')" 
          :class="{ active: currentView === 'manga' }"
        >漫画作品</button>

        <button 
          @click="switchView('anime')" 
          :class="{ active: currentView === 'anime' }"
        >アニメ作品</button>
    </div>

    <!-- プルダウン（漫画・アニメの時だけ） -->
    <div v-if="currentView === 'manga' || currentView === 'anime'" class="site-filter">
      <label>配信サイト:</label>
      <select v-model="selectedSite" @change="fetchWorks">
        <option value="__all__">すべて</option>
        <option value="__unregistered__">未登録</option>
        <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
      </select>
    </div>

    <!-- 全表示ビュー（ランダム10件ずつ） -->
    <template v-if="currentView === 'all'">
      <section class="section">
        <h2 class="section-title">現在視聴している作品</h2>
        <div v-if="filteredRandomWatching.length > 0" class="cards all-view">
          <div v-for="item in filteredRandomWatching" :key="item.work_id" class="card" @click="viewDetail(item.work_id)">
            <div class="image-box">
              <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
              <div v-else class="placeholder">イメージがありません</div>
            </div>
            <p class="title">{{ item.title }}</p>
          </div>
        </div>
        <div v-else class="empty">現在視聴しているものはありません</div>
      </section>

      <section class="section">
        <h2 class="section-title">視聴完了した作品</h2>
        <div v-if="filteredRandomCompleted.length > 0" class="cards all-view">
          <div v-for="item in filteredRandomCompleted" :key="item.work_id" class="card" @click="viewDetail(item.work_id)">
            <div class="image-box">
              <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
              <div v-else class="placeholder">イメージがありません</div>
            </div>
            <p class="title">{{ item.title }}</p>
          </div>
        </div>
        <div v-else class="empty">視聴完了した作品はありません</div>
      </section>

      <section class="section">
        <h2 class="section-title">未視聴の作品</h2>
        <div v-if="filteredRandomUnwatched.length > 0" class="cards all-view">
          <div v-for="item in filteredRandomUnwatched" :key="item.work_id" class="card" @click="viewDetail(item.work_id)">
            <div class="image-box">
              <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
              <div v-else class="placeholder">イメージがありません</div>
            </div>
            <p class="title">{{ item.title }}</p>
          </div>
        </div>
        <div v-else class="empty">未視聴の作品はありません</div>
      </section>
    </template>

    <!-- 視聴中ビュー（全件表示） -->
    <template v-if="currentView === 'watching'">
      <section class="section">
        <h2 class="section-title">現在視聴している作品</h2>
        <div v-if="filteredWatchingItems.length > 0" class="cards">
          <div v-for="item in filteredWatchingItems" :key="item.work_id" class="card" @click="viewDetail(item.work_id)">
            <div class="image-box">
              <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
              <div v-else class="placeholder">イメージがありません</div>
            </div>
            <p class="title">{{ item.title }}</p>
          </div>
        </div>
        <div v-else class="empty">現在視聴しているものはありません</div>
      </section>
    </template>

    <!-- 漫画・アニメビュー（絞り込み結果全部表示） -->
    <template v-if="currentView === 'manga' || currentView === 'anime'">
      <section class="section">
        <h2 class="section-title">作品一覧</h2>
        <div v-if="filteredWorks.length > 0" class="cards">
          <div v-for="item in filteredWorks" :key="item.work_id" class="card" @click="viewDetail(item.work_id)">
            <div class="image-box">
              <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
              <div v-else class="placeholder">イメージがありません</div>
            </div>
            <p class="title">{{ item.title }}</p>
          </div>
        </div>
        <div v-else class="empty">該当する作品はありません</div>
      </section>
    </template>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const sites = ref([])
const works = ref([])
const selectedSite = ref('__all__')
const currentView = ref('all')
const router = useRouter()

// 全表示用（ランダム10件ずつ）
const randomItems = ref({ watching: [], completed: [], unwatched: [] })

// 全件リスト（視聴中フィルタ用）
const items = ref([])

// 視聴中ビュー → 全件からフィルタ
const watchingItems = computed(() => {
  return items.value.filter(i => i.status === '視聴中')
})

// 全表示ビュー → ランダム10件
const completedItems = computed(() => randomItems.value.completed || [])
const unwatchedItems = computed(() => randomItems.value.unwatched || [])

// 漫画・アニメビュー → サイト絞り込み結果
async function fetchWorks() {
  let siteParam = null

  if (selectedSite.value === '__all__') {
    siteParam = null
  } else if (selectedSite.value === '__unregistered__') {
    siteParam = ''   // ★ 未登録は空文字を送る
  } else {
    siteParam = selectedSite.value
  }

const res = await axios.get(
  `${import.meta.env.VITE_API_BASE_URL}/api/works`,
  {
    params: {
      user_id: 123,
      type: currentView.value === 'manga' ? '漫画'
          : currentView.value === 'anime' ? 'アニメ'
          : null,
      site: siteParam
    }
  })

  works.value = res.data
}

async function fetchSites() {
  if (currentView.value === 'manga') {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/apps`,
    { params: { type: '漫画' } }
  )
    sites.value = res.data
  } else if (currentView.value === 'anime') {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/apps`,
    { params: { type: 'アニメ' } }
  )
    sites.value = res.data
  } else {
    sites.value = []
  }
}

function switchView(view) {
  currentView.value = view
  fetchSites()
  if (view === 'manga' || view === 'anime') {
    fetchWorks()
  }
}

onMounted(async () => {
  const view = router.currentRoute.value.query.view
  if (view) {
    currentView.value = 'all'
    selectedSite.value = '__all__'
    await fetchSites()
    await fetchWorks()
  } else {
    await fetchWorks()
  }

  const resRandom = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/home-random`,
    { params: { user_id: 123 } }
  )
  randomItems.value = resRandom.data

  const resWorks = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/works`,
    { params: { user_id: 123 } }
  )
  items.value = resWorks.data
})

function viewDetail(id) {
  router.push({ path: `/detail/${id}`, query: { view: currentView.value } })
}

function goRegister() {
  router.push('/register')
}

// 文字列をひらがなに変換する関数
function normalizeForHomeSearch(str) {
  if (!str) return ''
  return str
    .normalize('NFKC') // 全角半角を統一
    .replace(/[\u30A1-\u30F6]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60) // カタカナ→ひらがな
    )
    .toLowerCase() // 英語は小文字化（大文字小文字を無視）
}
// 検索用
const searchQuery = ref('')

// 全画面用（ランダム10件を検索）
const filteredRandomWatching = computed(() =>
  randomItems.value.watching.filter(item =>
    normalizeForHomeSearch(item.title).includes(normalizeForHomeSearch(searchQuery.value))
  )
)

const filteredRandomCompleted = computed(() =>
  randomItems.value.completed.filter(item =>
    normalizeForHomeSearch(item.title).includes(normalizeForHomeSearch(searchQuery.value))
  )
)

const filteredRandomUnwatched = computed(() =>
  randomItems.value.unwatched.filter(item =>
    normalizeForHomeSearch(item.title).includes(normalizeForHomeSearch(searchQuery.value))
  )
)

// 視聴中用（全件からフィルタ）
const filteredWatchingItems = computed(() =>
  watchingItems.value.filter(item =>
    normalizeForHomeSearch(item.title).includes(normalizeForHomeSearch(searchQuery.value))
  )
)

// 漫画・アニメ用（絞り込み結果からフィルタ）
const filteredWorks = computed(() =>
  works.value.filter(item =>
    normalizeForHomeSearch(item.title).includes(normalizeForHomeSearch(searchQuery.value))
  )
)
</script>

<style scoped>
/* =========================
   基本レイアウト
========================= */
.home {
  padding: 20px;
  background: #f9f9f9;
}

/* =========================
   検索バー & 新規登録
========================= */
.search-bar {
  padding: 8px;
  width: 250px;
  height: 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.register-btn {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
}

/* =========================
   セクション
========================= */
.section {
  margin-top: 30px;
}

.section-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  border-left: 4px solid #007bff;
  padding-left: 8px;
}

/* =========================
   サイトフィルター
========================= */
.site-filter {
  margin-top: 10px;
}

.site-filter label {
  font-size: 18px;
  margin-right: 10px;
}

.site-filter select {
  padding: 10px 14px;
  font-size: 14px;
  width: 150px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

/* =========================
   カード一覧
========================= */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.card {
  width: 220px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  background: #fff;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* =========================
   画像ボックス（全デバイス共通）
========================= */
.image-box {
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 全画像を切らずに表示 */
}

/* =========================
   タイトル
========================= */
.title {
  margin-top: 10px;
  font-weight: bold;
  font-size: 1em;
  color: #333;
}

/* =========================
   空表示
========================= */
.empty {
  color: #666;
  background: #eee;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

/* =========================
   PC用フィルター（home-filters）
========================= */
.home-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
  padding: 0 10px;
}

.home-filters button {
  flex: 1;
  padding: 8px 0;
  text-align: center;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
}

.home-filters button.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
  font-weight: bold;
}

/* =========================
   スマホ画面
========================= */
@media (max-width: 600px) {

  .home {
    padding: 10px;
  }

  .search-bar {
    width: 100%;
    box-sizing: border-box;
  }

  /* ===== 共通カード設定（スマホ） ===== */
  .card {
    width: 160px;
    flex: 0 0 auto;
    margin: 0;
  }

  .title {
    font-size: 0.9em;
  }

  .home-filters {
    display: none;
  }

  /* ===== 全表示ビュー以外は2列グリッド ===== */
  .cards:not(.all-view) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .cards:not(.all-view) .card {
    width: 100%;
    flex: none;
  }

  /* ===== 全表示ビューだけ横スクロール ===== */
  .cards.all-view {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 12px;
    padding-bottom: 10px;
    -webkit-overflow-scrolling: touch;
  }

  /* ===== スクロールバーを表示する ===== */
  .cards.all-view::-webkit-scrollbar {
    height: 8px;
  }

  .cards.all-view::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 4px;
  }

  .cards.all-view::-webkit-scrollbar-track {
    background: #eee;
  }
}
</style>
