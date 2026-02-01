<template>
  <div v-if="work">
    <h1>{{ work.title }}</h1>
    <img v-if="work.image_url" :src="work.image_url" alt="cover" />
    <p><strong>作者:</strong> {{ work.author }}</p>
    <p><strong>出版社:</strong> {{ work.publisher }}</p>
    <p><strong>概要:</strong> {{ work.summary }}</p>
    <p><strong>種類:</strong> {{ work.work_type }}</p>

    <h3>タグ一覧</h3>
    <ul>
      <li v-for="tag in work.tags" :key="tag">{{ tag }}</li>
    </ul>
  </div>
  <div v-else>
    <p>作品情報を取得できませんでした。</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'WorkDetail',
  data() {
    return {
      work: null
    };
  },
  async created() {
    const id = this.$route.params.id; // ← URLから作品IDを取得
    try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/works/${id}`
        );

      const rows = res.data;

      if (rows.length > 0) {
        const base = rows[0];
        this.work = {
          ...base,
          tags: rows.map(r => r.tag_name).filter(t => t) // タグを配列にまとめる
        };
      }
    } catch (err) {
      console.error(err);
    }
  }
};
</script>

<style scoped>
img {
  max-width: 200px;
  margin-bottom: 16px;
}
</style>
