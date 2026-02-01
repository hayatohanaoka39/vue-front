<template>
  <div class="detail-view" v-if="work">
  <Header title="作品詳細">
    <template #right>
      <div class="buttons">
        <button @click="updateWork">更新</button>
        <button @click="deleteWork">一覧から削除</button>
        <button @click="goBack">戻る</button>
      </div>
    </template>

    <template #bottom>
      <!-- スクロールが一番上ならナビゲーション -->
      <NavLinks v-if="isTop" />
    </template>
  </Header>

	<div class="form-container">
	    <!-- 写真とあらすじ -->
	    <div class="info-row">
	      <div class="image-box">
	        <div class="image-container" @click="zoomImage">
	          <img v-if="work.image_url" :src="work.image_url" alt="作品画像" />
	          <div v-else class="no-image">イメージがありません</div>
	        </div>
	      </div>

		<!-- 画像拡大モーダル -->
    	<div v-if="showImageModal" class="modal" @click.self="closeModal">
      		<div class="modal-content">
				<button @click="closeModal" class="close-btn">×</button>
        		<img :src="work.image_url" alt="拡大画像" />
      		</div>
    	</div>

	      <div class="summary-wrapper">
	        <div class="summary-label">あらすじ</div>
	        <div class="summary-box" @click="zoomSummary">
	          <p class="summary">{{ work.summary }}</p>
	        </div>
	      </div>
	    </div>

		<!-- あらすじ拡大モーダル -->
    	<div v-if="showSummaryModal" class="modal" @click.self="closeModal">
      		<div class="modal-content summary-modal">
        		<h3>あらすじ</h3>
        		<p>{{ work.summary }}</p>
        		<button @click="closeModal" class="close-btn">×</button>
      		</div>
    	</div>

      <!-- タイトル -->
      <div class="form-row title-row">
        <label class="label-title">タイトル :</label>
        <span class="title">{{ work.title }}</span>
      </div>


	    <!-- 著作者 -->
	    <div class="form-row">
	      <label class="label-author">著作者 :</label>
	      <span class="author">{{ work.author }}</span>
	    </div>

	    <!-- 出版社 -->
	    <div class="form-row">
	      <label class="label-publisher">出版社 :</label>
	      <span class="publisher">{{ work.publisher }}</span>
	    </div>

	    <!-- 編集フォーム -->
	    <div class="form-row">
	      <label class="label-status">視聴状況 :</label>
	      <select v-model="work.status">
	        <option value="未視聴">未視聴</option>
	        <option value="視聴中">視聴中</option>
	        <option value="視聴完了">視聴完了</option>
	      </select>
	    </div>

	    <div class="form-row">
	      <label class="label-rating">満足度 :</label>
	      <div class="stars">
	        <span v-for="n in 5" :key="n" @click="work.rating = n">
	          {{ n <= work.rating ? '★' : '☆' }}
	        </span>
	      </div>
	    </div>

	    <div class="form-row">
	      <label class="label-site">配信サイト :</label>
	      <input type="text" v-model="work.site" placeholder="Netflixなど" />
	    </div>

		<!-- ジャンル -->
		<div class="form-row">
	  		<label class="label-genre">ジャンル :</label>
	  		<div class="genre-box">
	    		<!-- 既存タグの表示と削除ボタン -->
	    		<span v-for="(tag, index) in work.tags" :key="tag" class="tag">
	      			{{ tag }}
	      			<button @click="removeTag(index)" class="remove-btn">×</button>
	    		</span>

	    		<!-- 新しいタグ追加用の入力欄 -->
	    		<div class="add-tag">
	      			<input v-model="newTag" placeholder="ジャンルを入力" />
	      			<button @click="addTag">追加</button>
	    		</div>
	  		</div>
		</div>

	    <div class="form-row">
	      <label class="label-impression">感想 :</label>
	      <textarea v-model="work.impression" placeholder="感想を入力してください"></textarea>
	    </div>
	  </div>
	</div>
</template>

<script setup>
import NavLinks from '@/components/NavLinks.vue'
import Header from '@/components/Header.vue'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const work = ref(null)
const originalWork = ref(null)  // ← 初期データ保持
const newTag = ref('')
const isUpdated = ref(false)   // ← 更新済みフラグを追加

// モーダル表示用フラグ
const showImageModal = ref(false)
const showSummaryModal = ref(false)

onMounted(async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/${route.params.id}`
  )
  const rows = res.data
  if (rows.length > 0) {
    const base = rows[0]
    const data = {
      title: base.title || '',
      image_url: base.image_url || '',
      summary: base.summary || '',
      author: base.author || '',
      publisher: base.publisher || '',
      status: base.status || '未視聴',
      rating: base.satisfaction || 0,
      site: base.watching_apps || '',
      impression: base.impression || '',
      tags: base.tags || [],
      user_work_id: base.user_work_id || null
    }
    work.value = { ...data }
    originalWork.value = { ...data }
  }
})

// 変更検知関数
function hasChanges() {
  return JSON.stringify(work.value) !== JSON.stringify(originalWork.value)
}

async function updateWork() {
  try {
  await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/api/works/${route.params.id}/update`,
    {
      title: work.value.title,
      summary: work.value.summary,
      author: work.value.author,
      publisher: work.value.publisher,
      status: work.value.status,
      satisfaction: work.value.rating,
      impression: work.value.impression,
      watching_apps: work.value.site,
      user_work_id: work.value.user_work_id,
      tags: work.value.tags
    }
  )
    isUpdated.value = true   // ← 更新成功後にフラグを立てる

    // 保存成功後に最新データを再取得
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/${route.params.id}`
    )
    const rows = res.data
    if (rows.length > 0) {
      const base = rows[0]
      work.value = {
        title: base.title || '',
        image_url: base.image_url || '',
        summary: base.summary || '',
        author: base.author || '',
        publisher: base.publisher || '',
        status: base.status || '未視聴',
        rating: base.satisfaction || 0,
        site: base.watching_apps || '',
        impression: base.impression || '',
        tags: base.tags || [],
		user_work_id: base.user_work_id || null
      }
    }

    alert('更新しました')
  } catch (err) {
    console.error(err)
    alert('更新に失敗しました')
  }
}

async function deleteWork() {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/works/${route.params.id}/delete`
    )
    alert('一覧から削除しました')
    router.back()
  } catch (err) {
    console.error(err)
    alert('削除に失敗しました')
  }
}

function goBack() {
  if (hasChanges() && !isUpdated.value) {
    const confirmed = window.confirm("変更がありますが更新していません。戻りますか？")
    if (confirmed) {
      router.back()
    }
  } else {
    router.back()
  }
}

function zoomImage() {
  showImageModal.value = true
}

function zoomSummary() {
  showSummaryModal.value = true
}

function closeModal() {
  showImageModal.value = false
  showSummaryModal.value = false
}

function addTag() {
  if (newTag.value && !work.value.tags.includes(newTag.value)) {
    work.value.tags.push(newTag.value)
    newTag.value = ''
  }
}

function removeTag(index) {
  work.value.tags.splice(index, 1)
}

watch([showImageModal, showSummaryModal], ([img, summary]) => {
  if (img || summary) {
    document.body.style.overflow = 'hidden'   // スクロール禁止
  } else {
    document.body.style.overflow = ''         // 元に戻す
  }
})
</script>

<style scoped>
.detail-view {
  padding: 20px;
  background: #f9f9f9;
}

.form-container {
  max-width: 600px;   /* フォームだけ幅制限 */
  margin: auto;       /* 中央寄せ */
  padding: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* ← 左寄せ */
  width: 100%;
  margin-bottom: 10px;
}

.title-label {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 6px;
  font-family: sans-serif;
}

.title {
  font-size: 20px;   /* 他の項目と同じくらいに */
  font-weight: bold;
  padding-top: 4px;  /* 著作者・出版社と揃える */
  margin: 0;         /* h1用の余白を削除 */
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end; /* 右寄せ */
  width: 100%;               /* ← 横幅いっぱいに広げる */
  margin: 20px 0;
}

.buttons button {
  font-size: 17px;             /* ボタンの文字サイズ */
  padding: 6px 12px;
}

.info-row {
  display: flex;              /* 横並びにする */
  justify-content: center;   /* 横方向の中央寄せ */
  align-items: center;       /* 縦方向の中央揃え → 写真の真ん中にあらすじが来る */
  gap: 20px;                  /* 枠同士の間隔 */
  margin-bottom: 20px;
}

.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.modal-content img {
  margin-top: 20px;
  max-width: 100%;
  max-height: 80vh;
}

.summary-modal {
  width: 800px;          /* 横幅を広げる */
  max-height: 80vh;      /* 画面の高さの8割まで使う */
  font-size: 20px;       /* 文字を少し大きく */
  line-height: 1.8;      /* 行間を広めにして読みやすく */
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 28px;   /* 少し大きめ */
  font-weight: bold;
  color: #333;       /* 画像に負けない濃い色 */
  cursor: pointer;
  z-index: 10;       /* 画像より前面に出す */
}

.image-container {
  width: 250px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 4px;
}

.image-box {
  /* 枠サイズを画像に合わせる */
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;          /* 枠に合わせてトリミング */
}

.summary-wrapper {
  display: flex;
  flex-direction: column; /* ラベルを上、枠を下に縦並び */
  align-items: flex-start; /* 左寄せ */
  margin-bottom: 20px;
}

.summary {
  font-size: 20px;
  line-height: 1.6;
  cursor: pointer;
}

.summary-box {
  width: 500px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
  max-height: 230px;       /* 枠の高さを制限 */
  overflow-y: auto;        /* 長文はスクロールできるようにする */
  flex: 1;                 /* 横並びの残り幅を使う */
}

.summary-label {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 6px;
  font-family: sans-serif;
}

.author, .publisher {
  font-size: 18px;
  padding-top: 4px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.form-row label {
  font-weight: bold;
  text-align: right;
  margin-right: 8px;
}

/* ラベルごとに幅を指定 */
.label-title      { width: 128px; font-size: 20px; margin-left: 38px; }
.label-status     { width: 146px; font-size: 20px; margin-left: 20px; }
.label-rating     { width: 120px; font-size: 20px; margin-left: 45px; }
.label-site       { width: 121px; font-size: 20px; margin-left: 44px; }
.label-impression { width: 137px; font-size: 20px; margin-left: 20px; }
.label-genre      { width: 120px; font-size: 20px; margin-left: 44px; }
.label-author     { width: 128px; font-size: 20px; margin-left: 38px; }
.label-publisher  { width: 128px; font-size: 20px; margin-left: 38px; }

/* 入力欄 */
.form-row select,
.form-row input,
.form-row textarea {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.stars {
  display: flex;
  gap: 4px;          /* ★の間隔 */
  width: 120px;      /* 全体の幅を固定 */
}

.stars span {
  font-family: monospace;  /* 等幅フォントで揃える */
  font-size: 20px;
  cursor: pointer;
}

.tag {
  margin-bottom: 6px;
  padding: 4px 8px;
  background: #eee;
  border-radius: 4px;
  cursor: pointer;
}
.tags {
  flex: 1;                  /* タグ一覧は残り幅を使う */
  display: flex;
  flex-direction: column;   /* ← 縦並びにする */
}

.label-genre {
  width: 120px;              /* ラベル幅を固定 */
  font-weight: bold;
  text-align: right;
  margin-right: 8px;
}

.genre-box {
  flex: 1;
  border: 1px solid #ccc;      /* 枠線 */
  border-radius: 6px;          /* 角丸 */
  padding: 10px;               /* 内側余白 */
  background: #fafafa;         /* 背景色 */
  display: flex;
  flex-direction: column;      /* 縦並びにする */
}

.form-row textarea {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 100px;   /* ← 高さを広げる */
  width: 300px;
  resize: vertical;    /* ← ユーザーが縦方向にリサイズできるようにする */
}

/*スマホ用*/
@media (max-width: 600px) {

  /* detail-view を flex にして順番を制御 */
  .detail-view {
    display: flex;
    flex-direction: column;
  }

  /* タイトルを一番上に */
  .title-row {
    order: 1;
  }

  /* 画像＋あらすじをその次に */
  .info-row {
    order: 2;
  }

  /* form-container の中の他の項目はその下 */
  .form-container {
    order: 3;
  }

  .info-row {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .image-container {
    width: 180px;
    height: 240px;
  }

  .summary-box {
    width: 100%;
    max-height: 200px;
  }

  /* ← タイトルは form-row と同じ扱いにするので中央寄せしない */

  .title {
    font-size: 18px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start; /* ← これでタイトルも左寄せになる */
  }

  .form-row label {
    width: auto !important;
    margin-bottom: 4px;
    text-align: left;
    margin-left: 0;
  }

  .form-row input,
  .form-row select,
  .form-row textarea {
    width: 100% !important;
  }

  .buttons {
    justify-content: center;
  }

  .buttons button {
    font-size: 16px;
    padding: 8px 14px;
  }
}

/* タブレット向け（600px〜1024px） */
@media (min-width: 600px) and (max-width: 1024px) {

  .detail-view {
    padding: 16px;
  }

  /* 画像＋あらすじは横並びのまま、比率を調整 */
  .info-row {
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
  }

  /* 画像サイズをタブレット向けに調整 */
  .image-container {
    width: 200px;
    height: 260px;
  }

  /* あらすじボックスを可変幅に */
  .summary-box {
    width: 100%;
    max-width: 500px;
    max-height: 260px;
  }

  /* タイトルは中央寄せしない（PC と同じ） */
  .title-row {
    justify-content: flex-start;
  }

  /* フォームは縦並びに近づける */
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row label {
    width: auto !important;
    margin-bottom: 4px;
    margin-left: 0 !important;
    text-align: left;
  }

  .form-row input,
  .form-row select,
  .form-row textarea {
    width: 100% !important;
  }

  /* ボタンは中央寄せ */
  .buttons {
    justify-content: center;
  }
}

</style>
