<template>
  <div>
    <button @click="classifyGenre">ジャンル検索</button>
    <ul v-if="genres">
      <li v-for="(prob, genre) in genres" :key="genre">
        {{ genre }} ({{ (prob * 100).toFixed(1) }}%)
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      genres: null
    }
  },
  methods: {
async classifyGenre() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/classify-genre`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "テスト作品",
        summary: "あらすじテキスト"
      })
    }
  );
      const data = await response.json();
      this.genres = data.genres;
    }
  }
}
</script>
