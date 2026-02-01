<template>
    <div class="anime-listview">
        <Header title="アニメ一覧">
            <template #right>
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="作品を検索"
                    class="search-bar"
                />
                <button @click="goToRegister" class="register-btn">新規登録</button>
            </template>
        </Header>

        <!-- アニメ一覧ビュー -->
        <div class="site-filter">
            <label>配信サイト:</label>
            <select v-model="selectedSite" @change="fetchWorks">
                <option value="__all__">すべて</option>
                <option value="__unregistered__">未登録</option>
                <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
            </select>
        </div>

        <!-- 一覧表示 -->
        <div class="card-list">
            <div
                v-for="item in filteredItems"
                :key="item.work_id"
                class="card"
                @click="viewDetail(item.work_id)"
            >
                <div class="card-image">
                    <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
                    <div v-else class="no-image">イメージがありません</div>
                </div>

                <div class="card-content">
                    <div class="card-info">
                        <h3 class="title">{{ item.title }}</h3>
                        <p>
                            <span class="label">視聴状況:</span>
                            <span class="value">{{ item.status }}</span>
                        </p>
                        <p>
                            <span class="label">満足度:</span>
                            <span class="value">
                                <span v-for="n in Number(item.satisfaction) || 0" :key="n">★</span>
                                <span v-for="n in (5 - (Number(item.satisfaction) || 0))" :key="'empty'+n">☆</span>
                            </span>
                        </p>
                    </div>
                    <button @click.stop="deleteItem(item.work_id)" class="delete-btn">削除</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const sites = ref([])
const selectedSite = ref('__all__')
const items = ref([])

onMounted(async () => {
  await fetchSites()
  await fetchWorks()
})

// 検索用
const searchQuery = ref('')
const filteredItems = computed(() =>
  items.value
    .filter(item => {
      const titleNormalized = toHiragana(item.title).toLowerCase()
      const queryNormalized = toHiragana(searchQuery.value).toLowerCase()
      return titleNormalized.includes(queryNormalized)
    })
    .sort((a, b) => {
      if (a.work_id === 1) return -1
      if (b.work_id === 1) return 1
      return a.work_id - b.work_id
    })
)

// 詳細画面へ遷移
function viewDetail(id) {
  router.push(`/detail/${id}`)
}

// 削除処理
async function deleteItem(workId) {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/${workId}/delete`
    )
    items.value = items.value.filter(item => item.work_id !== workId)
    alert('ごみ箱に移動しました')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || '削除に失敗しました')
  }
}

// 登録画面へ遷移
function goToRegister() {
  router.push('/register')
}

// サイト一覧を取得
async function fetchSites() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/apps`,
      { params: { type: 'アニメ' } }
    )
    sites.value = res.data
  } catch (err) {
    console.error(err)
  }
}

// アニメ作品を取得（サイト絞り込み対応）
async function fetchWorks() {
  try {
    let siteParam = null;

    if (selectedSite.value === '__all__') {
      siteParam = null;
    } else if (selectedSite.value === '__unregistered__') {
      siteParam = ''; // 未登録指定
    } else {
      siteParam = selectedSite.value;
    }

    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/anime`,
      { params: { user_id: 123, site: siteParam } }
    )
    items.value = res.data;
  } catch (err) {
    console.error(err);
  }
}

onMounted(async () => {
  await fetchSites()
  await fetchWorks()
})

// ひらがな⇔カタカナ変換
function toHiragana(str) {
  if (!str) return ''
  return str.normalize('NFKC')
    .replace(/[\u30A1-\u30F6]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    )
}

// 検索用
const searchQuery = ref('')
const filteredItems = computed(() =>
  items.value
    .filter(item => {
      const titleNormalized = toHiragana(item.title).toLowerCase()
      const queryNormalized = toHiragana(searchQuery.value).toLowerCase()
      return titleNormalized.includes(queryNormalized)
    })
    .sort((a, b) => {
      if (a.work_id === 1) return -1
      if (b.work_id === 1) return 1
      return a.work_id - b.work_id
    })
)

// 詳細画面へ遷移
function viewDetail(id) {
  router.push(`/detail/${id}`)
}

// 削除処理
async function deleteItem(workId) {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/${workId}/delete`
    )
    items.value = items.value.filter(item => item.work_id !== workId)
    alert('ごみ箱に移動しました')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || '削除に失敗しました')
  }
}

// 登録画面へ遷移
function goToRegister() {
  router.push('/register')
}

// サイト一覧を取得
async function fetchSites() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/apps`,
      { params: { type: 'アニメ' } }
    )
    sites.value = res.data
  } catch (err) {
    console.error(err)
  }
}

// アニメ作品を取得（サイト絞り込み対応）
async function fetchWorks() {
  try {
    let siteParam = null;

    if (selectedSite.value === '__all__') {
      siteParam = null;
    } else if (selectedSite.value === '__unregistered__') {
      siteParam = ''; // 未登録指定
    } else {
      siteParam = selectedSite.value;
    }

    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/anime`,
      { params: { user_id: 123, site: siteParam } }
    )
    items.value = res.data;
  } catch (err) {
    console.error(err);
  }
}
</script>

<style scoped>
.anime-listview {
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;       /* 背景を画面全体に固定 */
  background-attachment: fixed;
}

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

.site-filter {
  margin-bottom: 30px; /* サイト選択とカードの間に余白 */
}

.site-filter select {
  padding: 10px 14px;   /* 内側余白を広げる */
  font-size: 14px;      /* 文字サイズを大きくする */
  width: 150px;         /* 横幅を広げる（好みに合わせて調整） */
  border: 1px solid #ccc;
  border-radius: 6px;
}
.site-filter label {
  font-size: 18px;      /* ラベルも少し大きく */
  margin-right: 10px;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.card {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background: #fafafa;
  margin: 0 auto;
}
.card-image {
  width: 140px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 4px;
  margin-right: 15px;
}
.card-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
.no-image {
  font-size: 12px;
  color: #666;
}
.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}
.card-info {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
.title {
  align-self: flex-start;
  font-size: 30px;
  font-weight: bold;
  margin: 0 0 8px 0;
}
.label {
  font-weight: bold;
}
.value {
  font-weight: normal;
  font-size: 18px;
  color: #f5a623;
}
.delete-btn {
  background-color: red;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  height: fit-content;
}

/* スマホ用 */
@media (max-width: 600px) {

  /* カード全体を横並びのコンパクトレイアウトに */
  .card {
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 10px;
    align-items: flex-start;
  }

  /* 画像を小さくする */
  .card-image {
    width: 90px;
    height: 120px;
    flex-shrink: 0;
  }

  .card-image img,
  .card-image .no-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* テキスト部分を縦並びに */
  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

.card-content .title {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.3;

  /* 標準仕様（まだ実験的） */
  line-clamp: 2;

  /* WebKit（iOS / Safari / Chrome） */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
}

  /* ラベルと値を縦並びに */
  .card-info p {
    margin: 0;
    font-size: 14px;
    line-height: 1.2;
  }

  /* 削除ボタンを下に配置して押しやすく */
  .delete-btn {
    margin-top: 6px;
    align-self: flex-start;
    padding: 6px 10px;
    font-size: 14px;
  }

  /* カード間の余白 */
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

</style>
