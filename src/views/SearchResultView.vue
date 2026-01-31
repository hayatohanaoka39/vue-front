<template>
  <div class="search-results">
    <h2>検索結果</h2>
    <ul>
      <li v-for="work in results" :key="work.work_id">
        {{ work.title }} ({{ work.work_type }})
        <button @click="selectWork(work)">選択</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({ results: Array })
const router = useRouter()

function selectWork(work) {
  // RegisterView に workId を渡す
  router.push({ name: 'register', query: { workId: work.work_id } })
}
</script>
