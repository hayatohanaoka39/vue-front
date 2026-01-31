import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import MangaView from '../views/MangaView.vue'
import AnimeView from '../views/AnimeView.vue'
import RecommendView from '../views/RecommendView.vue'
import RecommendList from '../views/RecommendListView.vue'
import TrashView from '../views/TrashView.vue'
import ListView from '../views/ListView.vue'
import RegisterView from '../views/RegisterView.vue'
import SearchResultView from '../views/SearchResultView.vue'
import DetailView from '../views/DetailView.vue'
import CandidateList from '../views/CandidateList.vue'
import SelectImage from '../views/SelectImage.vue'


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/manga', component: MangaView },
  { path: '/anime', component: AnimeView },
  { path: '/recommend', component: RecommendView },
  { path: '/recommend-list', name: 'recommend-list', component: RecommendList },
  { path: '/trash', component: TrashView },
  { path: '/list', component: ListView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/search-results', name: 'search-results', component: SearchResultView, props: true },
  { path: '/detail/:id', name: 'Detail', component: DetailView, props: true },
  { path: '/candidates', name: 'candidates', component: CandidateList, props: true },
  { path: '/select-image', name: 'select-image', component: SelectImage, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
