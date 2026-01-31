<template>
  <div class="trash">
     <Header title="ごみ箱" />

    	<p>削除した作品一覧</p>

	    <div v-if="trashItems.length === 0">
	      <p>ごみ箱は空です</p>
	    </div>

	    <div v-else class="card-list">
	      <div
	        v-for="item in trashItems"
	        :key="item.work_id"
	        class="card"
	        @click="viewDetail(item.work_id)"
	      >
	        <!-- 左側の画像 -->
	        <div class="card-image">
	          <img v-if="item.image_url" :src="item.image_url" alt="作品画像" />
	          <div v-else class="no-image">イメージがありません</div>
	        </div>

	        <!-- 右側のテキスト＋ボタン -->
	        <div class="card-content">
	          <div class="card-info">
	            <h2 class="title">{{ item.title }}</h2>
	            <p v-if="item.deleted_at">削除日: {{ new Date(item.deleted_at).toLocaleDateString() }}</p>
	          </div>
	          <div class="card-actions" @click.stop> <!-- ← stopでボタンはカードクリックを無効化 -->
	            <button class="restore" @click="restoreItem(item.work_id, item.title)">復元</button>
	            <button class="delete" @click="deleteItem(item.work_id, item.title)">完全削除</button>
	          </div>
	        </div>
	      </div>
	    </div>
	  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const trashItems = ref([])
const router = useRouter()

onMounted(async () => {
  try {
    const res = await axios.get(
      'https://anime-api-967759995465.asia-northeast1.run.app/api/works/trash'
    )
    trashItems.value = res.data
  } catch (err) {
    console.error('Trash API error:', err)
    alert('ごみ箱一覧の取得に失敗しました')
  }
})

function viewDetail(id) {
  router.push({ name: 'Detail', params: { id } })  // ← 詳細画面へ遷移
}

async function restoreItem(id, title) {
  try {
    await axios.put(
      `https://anime-api-967759995465.asia-northeast1.run.app/api/works/${id}/restore`
    )
    trashItems.value = trashItems.value.filter(item => item.work_id !== id)
    alert(` ${title} を復元しました`)
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || '復元に失敗しました')
  }
}

async function deleteItem(id, title) {
  try {
    await axios.put(
      `https://anime-api-967759995465.asia-northeast1.run.app/api/works/${id}/hide`
    )
    trashItems.value = trashItems.value.filter(item => item.work_id !== id)
    alert(`${title} を完全削除しました（非表示化）`)
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || '削除に失敗しました')
  }
}
</script>

<style scoped>
.trash{
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  display: flex;                /* 横並び */
  align-items: center;          /* 縦位置を揃える */
  width: 100%;                  /* 横幅いっぱい */
  max-width: 600px;             /* 横長カードの最大幅 */
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background: #fafafa;
  margin: 0 auto;               /* 中央寄せ */
}

.card-image {
  width: 140px;                 /* 左側の画像サイズ */
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
  display: flex;                /* テキストとボタンを横並び */
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.card-info {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;       /* タイトルを上揃え */
}

.card-actions button {
  min-width: 80px;
  margin-left: 8px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

button.restore {
  background-color: #4caf50;
  color: white;
}

button.delete {
  background-color: #f44336;
  color: white;
}

@media (max-width: 600px) {

  /* カード全体をコンパクトな横並びに */
  .card {
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
    margin-right: 10px;
  }

  .card-image img,
  .card-image .no-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* テキスト部分を縦並びに */
  .card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  /* タイトルを2行固定で揃える */
  .card-info .title {
    font-size: 16px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 削除日などのテキスト */
  .card-info p {
    margin: 0;
    font-size: 14px;
    line-height: 1.2;
  }

  /* ボタンを横並びにして押しやすく */
  .card-actions {
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .card-actions button {
    flex: 1;
    padding: 8px 10px;
    font-size: 14px;
    margin-left: 0;
  }

  /* カード間の余白 */
  .card-list {
    flex-direction: column;
    gap: 12px;
  }
}

</style>
