<template>
  <div class="recommend">
      <Header title="おすすめ紹介" />

	    <form @submit.prevent="searchRecommend">
	      <!-- 1. 媒体選択 -->
	      <div class="question">
	        <p class="question-text">1. どちらを視聴したいですか？</p>
	        <label><input type="radio" value="マンガ" v-model="answers[0]" />マンガ</label>
	        <label><input type="radio" value="アニメ" v-model="answers[0]" />アニメ</label>
	      </div>

		  <div class="question">
	    	<p class="question-text">2. 視聴したい作品のジャンルを選択してください</p>
	        <div v-if="genres.length > 0" class="genres">
	          <label v-for="genre in genres" :key="genre.id">
	            <input type="checkbox" :value="genre.name" v-model="selectedGenres" />
	            {{ genre.name }}
	          </label>
	        </div>
	        <div v-else>
	          ジャンルデータを読み込み中...
	        </div>
	      </div>

	      <!-- 3. 読みやすさ -->
	      <div class="question">
	        <p class="question-text">3. 視聴したい作品の読みやすさは？</p>
	        <label><input type="radio" value="サクッと見たい" v-model="answers[2]" />サクッと見たい</label>
	        <label><input type="radio" value="じっくり考えて見たい" v-model="answers[2]" />じっくり考えて見たい</label>
	      </div>

	      <!-- 4. 今の気分 -->
	      <div class="question">
	        <p class="question-text">4. 今の気分は？</p>
	        <label><input type="radio" value="明るい" v-model="answers[3]" />明るい</label>
	        <label><input type="radio" value="悲しい" v-model="answers[3]" />悲しい</label>
	        <label><input type="radio" value="怒っている" v-model="answers[3]" />怒っている</label>
	        <label><input type="radio" value="ぼーっとしている" v-model="answers[3]" />ぼーっとしている</label>
	      </div>

	      <!-- 5. 出版社/制作会社 -->
	      <div class="question">
	        <p class="question-text">5. どこの出版社/制作会社の作品を見たい？</p>
			<v-select
	        	v-model="answers[4]"
				:options="answers[0] === 'マンガ' ? mangaCompanies : animeCompanies"
            	placeholder="会社名を検索..."
				dropdown-position="above" 
    		/>
	      </div>

	      <!-- 6. ストーリー方向性 -->
	      <div class="question">
	        <p class="question-text">6. 作品のストーリーの方向性は？</p>
	        <label><input type="radio" value="バトル" v-model="answers[5]" />バトル</label>
	        <label><input type="radio" value="恋愛" v-model="answers[5]" />恋愛</label>
	        <label><input type="radio" value="日常" v-model="answers[5]" />日常</label>
	        <label><input type="radio" value="ミステリー" v-model="answers[5]" />ミステリー</label>
	      </div>

	      <!-- 7. 舞台設定 -->
	      <div class="question">
	        <p class="question-text">7. 作品の舞台設定はどこがいい？</p>
	        <label><input type="radio" value="現代" v-model="answers[6]" />現代</label>
	        <label><input type="radio" value="歴史" v-model="answers[6]" />歴史</label>
	        <label><input type="radio" value="未来" v-model="answers[6]" />未来</label>
	        <label><input type="radio" value="異世界" v-model="answers[6]" />異世界</label>
	      </div>

	      <!-- 8. 視聴状況 -->
	      <div class="question">
	        <p class="question-text">8. 視聴状況はどうする？</p>
	        <label><input type="radio" value="未視聴" v-model="answers[7]" />未視聴</label>
	        <label><input type="radio" value="視聴中" v-model="answers[7]" />視聴中</label>
	        <label><input type="radio" value="視聴完了" v-model="answers[7]" />視聴完了</label>
	        <label><input type="radio" value="特に気にしない" v-model="answers[7]" />特に気にしない</label>
	      </div>

	      <!-- 検索ボタン -->
	      <button type="submit" class="search-btn">検索</button>
	    </form>
	  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import vSelect from "vue3-select"
import "vue3-select/dist/vue3-select.css"

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const answers = ref(["", "", "", "", "", "", "", ""])
const genres = ref([])
const selectedGenres = ref([])

// 出版社リスト
const mangaCompanies = [
  '講談社','集英社','双葉社','一迅社','小学館',
  'KADOKAWA','幻冬舎コミックス','週刊少年チャンピオン',
  'スクウェア・エニックス','秋田書店','Ki-oon',
  '朝日新聞出版'
].sort().concat(['特になし'])


//制作会社リスト
const animeCompanies = [
  '東映アニメーション','エイトビット','勝鬨スタジオ','動画工房','ぴえろ','アクタス','AIC','WIT STUDIO',
  'A-1 Pictures','OLM','GAINAX','キネマシトラス','京都アニメーション','GONZO','GoHands','サテライト',
  'サンジゲン','サンライズ','シャフト','SILVER LINK.','J.C.STAFF','XEBEC','Studio五組','スタジオコメット',
  'スタジオディーン','ZEXCS','ゼロジー','タツノコプロ','ディオメディア','DLE','david production','MAPPA',
  'トムス・エンタテインメント','TRIGGER','P.A.WORKS','ファンワークス','feel.','ブレインズ・ベース','Lerche',
  'project No.9','プロダクションアイムズ','Production I.G','WHITE FOX','ボンズ','ポリゴン・ピクチュアズ',
  'マッドハウス','ufotable','ライデンフィルム'
].sort().concat(['特になし'])


onMounted(async () => {
  try {
    const res = await axios.get(
      'https://anime-api-967759995465.asia-northeast1.run.app/api/genres'
    )
    genres.value = res.data
  } catch (err) {
    console.error('ジャンル取得エラー:', err)
  }
})

function searchRecommend() {
  router.push({
    path: '/recommend-list',
    query: {
      answers: JSON.stringify(answers.value),
      genres: JSON.stringify(selectedGenres.value)
    }
  })
}
</script>

<style scoped>
.recommend{
  padding: 20px;
  background: #f9f9f9;
}

.question {
  margin-bottom: 20px;
}

.question-text {
  font-weight: bold;      /* 太字 */
  font-size: 1.2em;       /* 少し大きめ */
  margin-bottom: 8px;     /* 下に余白 */
}

.search-btn {
  margin-top: 20px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

.genres {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 横に5列 */
  gap: 10px; /* 各ジャンルの間隔 */
}

.genres label {
  display: flex;
  align-items: center;
  font-size: 0.9em;
}

/* スマホ用 */
@media (max-width: 600px) {

  .recommend {
    padding: 10px;
  }

  /* 質問ブロックを縦にゆったり */
  .question {
    margin-bottom: 24px;
  }

  .question-text {
    font-size: 16px;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  /* ラジオボタンを縦並びに */
  .question label {
    display: block;
    margin-bottom: 6px;
    font-size: 15px;
  }

  /* ジャンル一覧を縦並びに */
  .genres {
    display: grid;
	grid-template-columns: 1fr 1fr; /* ← 2列 */
    gap: 8px 12px;
  }

  .genres label { 
	display: flex; 
	align-items: center; 
	font-size: 15px; 
  }

  /* v-select の幅調整 */
  .question .vs__dropdown-toggle {
    width: 100% !important;
    box-sizing: border-box;
  }

  /* 検索ボタンを大きく押しやすく */
  .search-btn {
    width: 100%;
    padding: 12px;
    font-size: 18px;
    margin-top: 20px;
  }
}

</style>
