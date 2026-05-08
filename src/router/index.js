// 1. On change l'import ici
import { createRouter, createWebHashHistory } from 'vue-router' 
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import FilmsView from '../views/FilmsView.vue'
import SeriesView from '../views/SeriesView.vue'
import AnimationView from '../views/AnimationView.vue'
import AllTitlesView from '../views/AllTitlesView.vue'
import FilmDetailView from '../views/FilmDetailView.vue'
import ComediensView from '../views/ComediensView.vue'
import DoubleurView from '../views/DoubleurView.vue'
import ActeurOriginalView from '../views/ActeurOriginalView.vue'

const router = createRouter({
  // 2. On utilise createWebHashHistory avec le nom de ton repo
  history: createWebHashHistory('/Doublage-VFQ/'),
  routes: [
    { path: '/', component: HomeView },
    { path: '/recherche', component: SearchView },
    { path: '/catalogue', component: AllTitlesView },
    { path: '/films', component: FilmsView },
    { path: '/series', component: SeriesView },
    { path: '/animation', component: AnimationView },
    { path: '/comediens', component: ComediensView },
    { path: '/film/:id', component: FilmDetailView },
    { path: '/doubleur/:name', component: DoubleurView },
    { path: '/acteur/:name', component: ActeurOriginalView }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router