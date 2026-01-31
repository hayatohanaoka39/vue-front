<template>
  <header class="header">
    <div class="header-top">
      <div class="header-left">
        <HamburgerMenu />
        <h1>{{ title }}</h1>
      </div>
    </div>

    <!-- タイトル下に検索バーやボタンを配置 -->
    <div class="header-middle">
      <slot name="right"></slot>
    </div>

    <!-- スマホ専用：絞り込みボタン -->
    <div class="header-filters">
      <slot name="filters"></slot>
    </div>

    <!-- ナビゲーション -->
    <div class="header-bottom">
      <NavLinks />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import NavLinks from '@/components/NavLinks.vue'

defineProps({
  title: {
    type: String,
    required: true
  }
})

const isTop = ref(true)

function handleScroll() {
  isTop.value = window.scrollY === 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  border-bottom: 3px solid #000;
  padding-bottom: 10px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  overflow: visible;
}

.header-middle {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
}

.header-middle :deep(.search-bar) {
  width: 50%;
  max-width: 400px;
  height: 44px;
  font-size: 18px;
  padding: 0 12px;
}

.header-middle :deep(.register-btn) {
  padding: 10px 20px;
  font-size: 16px;
  white-space: nowrap;
}

.header-bottom { 
  display: block; 
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}



/* スマホではナビゲーション非表示 */
 @media (max-width: 600px) { 
  .header-middle {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .header-filters {
    display: flex; 
    flex-wrap: wrap; 
    gap: 8px; 
    margin-top: 10px; 
    padding: 0 10px; 
  }

  .header-middle :deep(.search-bar) {
    width: 100%; /* 検索バーは横いっぱい */
  }

  .header-middle :deep(.register-btn) {
    width: auto; /* ボタンは必要な幅だけ */
    padding: 8px 14px;
  }

  .header-bottom { 
    display: none !important; 
  } 

  /* スマホ用フィルターボタン */
.header-filters button {
  padding: 6px 10px;
  margin: 0 4px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  font-size: 14px;
}

/* ★ 選択中のボタン（スマホ） */
.header-filters :deep(button.active) {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
  font-weight: bold;
}

}

@media (min-width: 600px) { 
  .header-filters { 
    display: none; 
  }
}

</style>
