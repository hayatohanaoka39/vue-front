<template>
  <div>
    <!-- 常に表示されるハンバーガーボタン -->
    <button class="hamburger" :class="{ hidden: isOpen }" @click="toggleMenu">&#9776;</button>

    <!-- 背景オーバーレイ -->
    <div v-if="isOpen" class="overlay" @click="closeMenu"></div>

    <!-- 全画面メニュー -->
    <transition name="dropdown">
      <nav v-if="isOpen" class="hamburger-menu">
        <button class="close-btn" @click="closeMenu">×</button>
        <ul>
          <li><router-link to="/home" @click="closeMenu">ホーム</router-link></li>
          <li><router-link to="/register" @click="closeMenu">作品登録</router-link></li>
          <li><router-link to="/manga" @click="closeMenu">漫画</router-link></li>
          <li><router-link to="/anime" @click="closeMenu">アニメ</router-link></li>
          <li><router-link to="/recommend" @click="closeMenu">おすすめ紹介</router-link></li>
          <li><router-link to="/trash" @click="closeMenu">ごみ箱</router-link></li>
        </ul>
      </nav>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}
function closeMenu() {
  isOpen.value = false
}

watch(isOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
.hamburger {
  font-size: 40px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 30; /* ヘッダー内で確実に表示 */
}

.hamburger.hidden {
  display: none;
}

.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.3);
  z-index: 10;
}

.hamburger-menu {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: #fff;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 32px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 30;
  color: #333;
}

.hamburger-menu ul {
  list-style: none;
  padding: 0;
  margin: 60px 0 0;
  text-align: center;
}
.hamburger-menu li {
  margin: 20px 0;
  font-size: 1.5em;
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: transform 0.4s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  transform: translateY(-100%);
}

/* PCではハンバーガーを非表示 */
@media (min-width: 600px) {
  .hamburger {
    display: none;
  }
}

</style>
