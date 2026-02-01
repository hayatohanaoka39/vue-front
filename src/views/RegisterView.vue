<template>
  <div class="register-view">
    <Header title="作品登録" />

    <div class="form-container">
      <!-- 種別 -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">種別</span><span class="colon">:</span>
        </label>
        <select v-model="workType">
          <option value="アニメ">アニメ</option>
          <option value="漫画">漫画</option>
        </select>
      </div>

      <!-- タイトル + 検索ボタン -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">タイトル</span><span class="colon">:</span>
        </label>
        <div style="display:flex; flex:1; gap:8px;">
          <div class="title-input-group">
            <input type="text" v-model="title" style="flex:1;" />
            <button @click="searchDbWork" class="search-btn">探す</button>
          </div>  
        </div>
      </div>

      <!-- 著作者 -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">著作者</span><span class="colon">:</span>
        </label>
        <input type="text" v-model="author" />
      </div>

      <!-- 出版社/制作会社 -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">出版社/制作会社</span><span class="colon">:</span>
        </label>
        <input type="text" v-model="publisher" />
      </div>

      <!-- あらすじ -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">あらすじ</span><span class="colon">:</span>
        </label>
        <textarea v-model="summary" class="textarea-summary"></textarea>
      </div>

      <!-- 画像URL -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">画像URL</span><span class="colon">:</span>
        </label>
        <input type="text" v-model="imageUrl" placeholder="画像のURLを入力" />
      </div>

      <!-- 視聴状況 -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">視聴状況</span><span class="colon">:</span>
        </label>
        <select v-model="status">
          <option value="未視聴">未視聴</option>
          <option value="視聴中">視聴中</option>
          <option value="視聴完了">視聴完了</option>
        </select>
      </div>

      <!-- 満足度 -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">満足度</span><span class="colon">:</span>
        </label>
        <div class="stars">
          <span v-for="n in 5" :key="n" @click="rating = n">
            {{ n <= rating ? '★' : '☆' }}
          </span>
        </div>
      </div>

      <!-- 配信サイト -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">配信サイト</span><span class="colon">:</span>
        </label>
        <input type="text" v-model="site" />
      </div>

      <!-- ジャンル -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">ジャンル</span><span class="colon">:</span>
        </label>

        <div class="genre-panel">

          <!-- ★ 説明文を追加 -->
          <p class="genre-hint">※ジャンルはタイトル検索後に自動で推定されます</p>

          <ul v-if="genresList.length">
            <li v-for="([name, prob], idx) in genresList" :key="name + '-' + idx">
              <label>
                <input type="checkbox" v-model="selectedGenres" :value="name" />
                {{ name }} ({{ (prob * 100).toFixed(1) }}%)
              </label>
            </li>
          </ul>

          <div v-else class="genre-empty">ジャンル候補がまだありません</div>

          <!-- ★ ジャンル検索ボタンを削除（またはコメントアウト） -->
          <!-- <button @click="searchWork" class="search-btn">ジャンル検索</button> -->

        </div>
      </div>

      <!-- 選択されたジャンルだけ表示 -->
      <div class="form-row" v-if="selectedGenres.length">
        <label class="label">
          <span class="label-text">選択ジャンル</span><span class="colon">:</span>
        </label>
        <div class="genre-panel">
          <ul>
            <li v-for="name in selectedGenres" :key="name">{{ name }}</li>
          </ul>
        </div>
      </div>

      <!-- 感想 -->
      <div class="form-row">
        <label class="label">
          <span class="label-text">感想</span><span class="colon">:</span>
        </label>
        <textarea v-model="impression" class="textarea-impression"></textarea>
      </div>

	  <!-- キャンセルボタン -->
	  <div class="form-actions">
	    <button class="register-btn" @click="registerWork" :disabled="isClassifying">登録</button>
	    <button class="cancel-btn" @click="cancelRegister">キャンセル</button>
	  </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { nextTick } from 'vue'

const route = useRoute()
const router = useRouter()
const workId = ref(null)
const isClassifying = ref(false)

// 候補一覧をクエリから受け取る
let candidates = []
try {
  candidates = route.query.results ? JSON.parse(route.query.results) : []
  console.log("候補一覧データ:", candidates)
} catch (e) {
  console.error("候補一覧のパースエラー:", e)
}

const workType = ref('アニメ')
const title = ref('')
const author = ref('')
const publisher = ref('')
const summary = ref('')
const imageUrl = ref('')
const status = ref('未視聴')
const rating = ref(0)
const site = ref('')
const impression = ref('')

// ジャンル候補をオブジェクトで保持
const genresObj = ref({})
// 表示用に配列化＋確率降順ソート
const genresList = computed(() => {
  return Object.entries(genresObj.value || {}).sort((a, b) => b[1] - a[1])
})

// ユーザーが選択したジャンル
const selectedGenres = ref([])

onMounted(async () => {
  // ★ すべてのルートで共通して使う変数
  let loadedWork = null

  // ★ おすすめ画面からのデータ受け取り（種別 + タイトルのみ）
  if (route.query.work) {
    try {
      const received = JSON.parse(route.query.work)

      // loadedWork に代入
      loadedWork = {
        title: received.title || "",
        work_type: received.work_type || "",
        summary: received.summary || "",
        image_url: received.image_url || "",
        author: received.author || "",
        publisher: received.publisher || ""
      }

      console.log("おすすめから受け取った作品:", loadedWork)
    } catch (e) {
      console.error("おすすめ作品データの読み込み失敗:", e)
    }
  }

  // ★ DB にある作品を編集する場合
  if (route.query.workId) {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/${route.query.workId}`
    )
    const work = res.data[0]

    loadedWork = {
      work_id: work.work_id,
      title: work.title || '',
      author: work.author || '',
      publisher: work.publisher || '',
      summary: work.summary || '',
      image_url: work.image_url || '',
      work_type: work.work_type || ''
    }
  }

  // ★ 外部 API の候補を選んだ場合
  if (route.query.selected) {
    const raw = sessionStorage.getItem('selectedWork')
    if (raw) {
      const work = JSON.parse(raw)
      sessionStorage.removeItem('selectedWork')

      loadedWork = {
        title: work.title || '',
        author: work.author || '',
        publisher: work.publisher || '',
        summary: work.summary || '',
        image_url: work.image_url || '',
        work_type: work.work_type || ''
      }
    }
  }

  // ★ 画像候補一覧で選んだ画像URLを反映
const savedImage = sessionStorage.getItem('selectedImage')
if (savedImage) {
  imageUrl.value = savedImage
  sessionStorage.removeItem('selectedImage')
}


  // ★ ここで selectWork を呼ぶ（loadedWork がある場合のみ）
  if (loadedWork) {
    await selectWork(loadedWork)
  }
})

// DB検索 → なければ外部API
async function searchDbWork() {
  try {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/search-work`,
    {
      title: title.value,
      work_type: workType.value,
      user_id: 123
    })

    if (res.data.length > 0) {
      const work = res.data[0]
      selectWork(work)

      if (work.isRegistered) {
        alert("既にあなたのライブラリに登録されています!")
      } else {
        alert("作品はDBに存在しますが、まだ登録されていません。フォームに反映しました。")
      }
    } else {
      // DBに存在しない場合のみ外部APIへ
    const apiRes = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/fetch-external`,
      {
        title: title.value,
        work_type: workType.value
      })
      const results = Array.isArray(apiRes.data) ? apiRes.data : [apiRes.data]

      router.push({
        path: '/candidates',
        query: { results: JSON.stringify(results) }
      })
    }
  } catch (err) {
    console.error("検索エラー:", err)
  }
}

// 候補選択処理
async function selectWork(work) {
  workId.value = work.work_id || null
  title.value = work.title || ''
  author.value = work.author || ''
  publisher.value = work.publisher || ''
  summary.value = work.summary || ''
  imageUrl.value = work.image_url || ''
  workType.value = work.work_type || workType.value 
  alert("作品を選択しました！フォームに反映しました。")

// ★ 値が反映されるまで待つ 
  await nextTick()

  searchWork()
}

// 登録処理
// 登録処理
async function registerWork() {
  try {
    // まず既存作品チェック
    const checkRes = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/search-work`,
      {
        title: title.value,
        work_type: workType.value,
        user_id: 123
      }
    )

    if (checkRes.data.length > 0) {
      const existingWork = checkRes.data[0]

      if (existingWork.isRegistered) {
        const confirmed = window.confirm(
          `${existingWork.title} は既にあなたのライブラリに登録されています。\n詳細画面に移動しますか？`
        )
        if (confirmed) {
          router.push(`/detail/${existingWork.work_id}`)
        }
        return
      } else {
        // 作品はDBにあるがユーザー未登録 → user_works に新規登録
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/works`,
          {
            title: title.value,
            author: author.value,
            publisher: publisher.value,
            summary: summary.value,
            image_url: imageUrl.value,
            work_type: workType.value,
            user_id: 123,
            status: status.value,
            satisfaction: rating.value,
            impression: impression.value,
            watching_apps: site.value,
            tags: selectedGenres.value
          }
        )

        if (res.data.success) {
          alert("登録成功！")
          router.push(res.data.work_type === '漫画' ? '/manga' : '/anime')
        } else {
          alert(res.data.message || "登録は完了しませんでした")
        }
        return
      }
    }

    // DBに存在しない場合 → 新規登録（外部API補完あり）
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/works`,
      {
        title: title.value,
        author: author.value,
        publisher: publisher.value,
        summary: summary.value,
        image_url: imageUrl.value,
        work_type: workType.value,
        user_id: 123,
        status: status.value,
        satisfaction: rating.value,
        impression: impression.value,
        watching_apps: site.value,
        tags: selectedGenres.value
      }
    )

    if (res.data.success) {
      alert("登録成功！")
      router.push(res.data.work_type === '漫画' ? '/manga' : '/anime')
    } else {
      alert(res.data.message || "登録は完了しませんでした")
    }
  } catch (err) {
    console.error("登録エラー:", err)
    alert("登録に失敗しました")
  }
}

// ジャンル分類
async function searchWork() {
  try {
    isClassifying.value = true
    // 入力チェックを追加
    if (!summary.value || summary.value.trim() === '') {
      alert("あらすじが未入力のためジャンル選定できません")
      genresObj.value = {}
      selectedGenres.value = []
      return
    }
    if (summary.value.length < 50) {
      alert("あらすじが短すぎるためジャンル選定できません")
      genresObj.value = {}
      selectedGenres.value = []
      return
    }

    // 通常のジャンル分類処理
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/classify-genre`,
      {
        title: title.value,
        summary: summary.value
      }
    )

    if (res.data.error) {
      alert(res.data.error)
      genresObj.value = {}
      selectedGenres.value = []
      return
    }

    genresObj.value = res.data?.genres ?? {}

    if (Object.keys(genresObj.value).length > 0) {
      selectedGenres.value = genresList.value.map(([name]) => name)
    } else {
      selectedGenres.value = []
    }

    console.log("ジャンル候補:", genresObj.value)

  } catch (err) {
    console.error("ジャンル分類エラー:", err)
    if (err.response?.data?.error) {
      alert(err.response.data.error)
    } else {
      alert("ジャンル分類に失敗しました")
    }
    genresObj.value = {}
    selectedGenres.value = []
  } finally { 
    isClassifying.value = false // ★ 分類完了フラグ OFF 
  }
}

function selectCandidate(work) {
  if (work.work_id) {
    // DBにある作品ならIDだけ渡す
    router.push({
      path: '/register',
      query: { workId: work.work_id }
    })
  } else {
    // DB未登録の候補ならオブジェクトを渡す
    router.push({
      path: '/register',
      query: { selected: JSON.stringify(work) }
    })
  }
}

async function cancelRegister() {
  if (confirm("入力内容をリセットしますか？")) {
    try {
      if (workId.value) {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/works/user-works/${workId.value}/123`
        )
      }
    } catch (err) {
      console.error("キャンセル削除エラー:", err)
    }
    
        // 入力欄を初期状態に戻す
    workType.value = 'アニメ'
    title.value = ''
    author.value = ''
    publisher.value = ''
    summary.value = ''
    imageUrl.value = ''
    status.value = '未視聴'
    rating.value = 0
    site.value = ''
    impression.value = ''
    genresObj.value = {}
    selectedGenres.value = []
  }
}
</script>

<style scoped>
.register-view {
  padding: 20px;
  background: #f9f9f9;
}

.form-container {
  max-width: 600px;   /* フォームだけ幅制限 */
  margin: auto;       /* 中央寄せ */
  padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 3px solid #000;
    padding-bottom: 20px;
}

.search-btn {
  padding: 6px 12px;
  font-size: 16px;
}


.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.label {
  display: flex;
  width: 200px;
  justify-content: space-between;
  margin-right: 8px;
  font-weight: bold;
}

.label-text {
  text-align: left;
}

.colon {
  text-align: right;
  width: 20px;
}

input, select, textarea {
  flex: 1;
  font-size: 18px;
  padding: 6px;
}

.stars span {
  cursor: pointer;
  font-size: 22px;
}

.register-btn,
.cancel-btn {
  padding: 12px 24px;
  font-size: 20px;
  border: none;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.textarea-summary {
  min-height: 200px;
  flex: 1;
  font-size: 18px;
  padding: 8px;
  resize: vertical;
}

.textarea-impression {
  min-height: 100px;
  flex: 1;
  font-size: 18px;
  padding: 8px;
  resize: vertical;
}

.genre-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.genre-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.genre-panel ul {
  max-height: 220px;      /* 長いリストでも収まる高さ */
  overflow-y: auto;       /* はみ出したらスクロール */
  padding-left: 18px;     /* 箇条書きの余白 */
  margin: 0;
}

.genre-empty {
  color: #666;
  font-size: 16px;
}

/* スマホ用 */
@media (max-width: 600px) {
  /* タイトル入力欄とボタンを縦並びに */
  .title-input-group {
    display: flex;
    flex-direction: column;
    gap: 14px; /* ← 余白を広げる */
    width: 100%; /* ← これが重要！ */
  }

  /* 入力欄を他と同じ幅に */
  .title-input-group input {
    width: 100% !important;
    flex: none !important; /* ← flex:1 を無効化 */
    box-sizing: border-box;
  }

  /* 探すボタンも幅100% */
  .title-input-group .search-btn {
    width: 100%;
  }

  .form-container {
    padding: 10px;
  }

  /* ラベル＋入力欄を縦並びに */
  .form-row {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  /* ラベルの幅指定を解除 */
  .form-row .label {
    width: auto !important;
    margin-bottom: 4px;
    text-align: left;
  }

  .label-text,
  .colon {
    font-size: 16px;
  }

  /* 入力欄を画面幅いっぱいに */
  .form-row input,
  .form-row select,
  .form-row textarea {
    width: 100% !important;
    box-sizing: border-box;
  }

  .search-btn {
    width: 100%;
  }

  /* ジャンルパネルの調整 */
  .genre-panel {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  /* 満足度（★）の幅調整 */
  .stars {
    width: 100%;
    justify-content: flex-start;
  }

  /* ボタンを縦並び or 中央寄せ */
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }

  .register-btn,
  .cancel-btn {
    width: 100%;
    padding: 10px;
    font-size: 18px;
  }
}

</style>