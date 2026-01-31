<template>
  <nav class="nav-links">
    <router-link to="/home">ホーム</router-link>
    <router-link to="/register">作品登録</router-link>
    <router-link to="/manga">漫画</router-link>
    <router-link to="/anime">アニメ</router-link>
    <router-link to="/recommend">おすすめ紹介</router-link>
    <router-link to="/trash">ごみ箱</router-link>
  </nav>
</template>

<script setup>
// 特にロジックは不要。リンクだけのコンポーネント
</script>

<style scoped>
.nav-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  font-weight: bold;
  color: #333;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

/* 現在のページ */
.nav-links a.router-link-exact-active {
  background-color: #1976d2;
  color: #fff;
}

/* ホバー時 */
.nav-links a:hover {
  background-color: #e0e0e0;
}
</style>
