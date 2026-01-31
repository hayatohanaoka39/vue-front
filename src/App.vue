<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive include="HomeView" exclude="DetailView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
// 特に何も書かなくてもOK
</script>
