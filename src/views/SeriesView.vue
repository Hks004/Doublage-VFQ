<script setup>
import { inject, computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const items = inject('database')
const isLoaded = inject('isLoaded')
const router = useRouter()

const sortType = ref('default')
const selectedYear = ref('')

// 1. LIMITE D'AFFICHAGE INITIALE
const displayLimit = ref(40)

const navigateIfNoSelection = (movieId) => {
  const selection = window.getSelection().toString()
  if (!selection) {
    router.push('/film/' + movieId)
  }
}

const extractYear = (m) => {
  const val = m.theatricalRelease || m.extra?.theatricalRelease
  if (!val) return null
  const match = val.toString().match(/\d{4}/)
  return match ? match[0] : null
}

const availableYears = computed(() => {
  if (!items.value) return []
  const years = items.value
    .filter(m => m.extra?.projectType === 'Série télé')
    .map(m => extractYear(m))
    .filter(y => y !== null)
  return [...new Set(years)].sort((a, b) => b - a)
})

const filtered = computed(() => {
  if (!items.value) return []
  let list = items.value.filter(m => {
    const isProject = m.extra?.projectType === 'Série télé'
    const year = extractYear(m)
    return isProject && (selectedYear.value === '' || String(year) === String(selectedYear.value))
  })
  
  if (sortType.value === 'recent') {
    // Tri par ID du plus haut au plus bas (Ajouts récents)
    list.sort((a, b) => Number(b.movieId) - Number(a.movieId))
  } else if (sortType.value !== 'default') {
    list.sort((a, b) => {
      const nameA = (sortType.value === 'original' ? (a.originalName || a.extra?.originalName || '') : a.translatedName).toLowerCase()
      const nameB = (sortType.value === 'original' ? (b.originalName || b.extra?.originalName || '') : b.translatedName).toLowerCase()
      return nameA.localeCompare(nameB, sortType.value === 'original' ? 'en' : 'fr')
    })
  }
  return list
})

// 2. LISTE TRONQUÉE POUR LA PERFORMANCE
const visibleItems = computed(() => {
  return filtered.value.slice(0, displayLimit.value)
})

// 3. LOGIQUE DE CHARGEMENT PROGRESSIF (INFINITE SCROLL)
const loadMore = () => {
  if (displayLimit.value < filtered.value.length) {
    displayLimit.value += 40
  }
}

const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = window.innerHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 600) {
    loadMore()
  }
}

// Réinitialisation si l'utilisateur change de filtre
watch([sortType, selectedYear], () => {
  displayLimit.value = 40
  window.scrollTo(0, 0)
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const getPoster = (m) => {
  const baseUrl = 'https://image.tmdb.org/t/p/w342'
  const path = m.posterPath || m.extra?.posterPath
  return path ? (baseUrl + path) : null
}
</script>

<template>
  <div class="page" v-if="isLoaded">
    <div class="centered-wrapper">
      <div class="header-section">
        <div class="title-area">
          <h1>Séries Télé</h1>
          <p class="count">{{ filtered.length }} titres répertoriés</p>
        </div>
        
        <div class="controls">
          <div class="select-group">
            <label>Ordre</label>
            <select v-model="sortType">
              <option value="default">Par défaut</option>
              <option value="recent">Ajouts récents</option>
              <option value="vfq">A-Z (VFQ)</option>
              <option value="original">A-Z (Original)</option>
            </select>
          </div>
          <div class="select-group">
            <label>Année</label>
            <select v-model="selectedYear">
              <option value="">Toutes les années</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="titles-grid">
        <div v-for="m in visibleItems" :key="m.movieId" class="movie-card">
          <router-link :to="'/film/' + m.movieId" class="poster-link" draggable="false">
            <div class="poster-wrapper">
              <img v-if="getPoster(m)" :src="getPoster(m)" loading="lazy" draggable="false" />
              <div v-else class="placeholder"><span>VFQ</span></div>
              
              <div class="overlay-mobile">
                <span class="year-label">{{ extractYear(m) || '----' }}</span>
              </div>
            </div>
          </router-link>

          <div class="info" @mouseup="navigateIfNoSelection(m.movieId)">
            <h3 draggable="false">{{ m.translatedName }}</h3>
            <p class="original-name" draggable="false">{{ m.originalName || m.extra?.originalName || '' }}</p>
          </div>
        </div>
      </div>

      <div v-if="displayLimit < filtered.length" class="loader-scrolling">
        Chargement de la suite...
      </div>
    </div>
  </div>
  <div v-else class="loader">Chargement...</div>
</template>

<style scoped>
/* AUCUN CHANGEMENT DANS TES STYLES ORIGINAUX */
.centered-wrapper { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
.header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 50px; border-left: 4px solid var(--primary); padding-left: 20px; }
.title-area h1 { font-size: 3rem; font-weight: 900; margin: 0; text-transform: none; color: #fff; }
.count { color: #666; font-weight: 800; font-size: 0.9rem; margin-top: 5px; }

.controls { display: flex; gap: 20px; }
.select-group { display: flex; flex-direction: column; gap: 8px; }
.select-group label { font-size: 0.7rem; text-transform: none; color: #666; font-weight: 800; letter-spacing: 1px; }
select { background: #1a1a1a; color: #fff; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; min-width: 180px; outline: none; font-weight: 600; }

.titles-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 30px 20px; }
.movie-card { display: flex; flex-direction: column; min-width: 0; }

.poster-link { text-decoration: none; display: block; transition: transform 0.3s ease; }
.poster-link:hover { transform: scale(1.02); }

.poster-wrapper { position: relative; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; background: #171717; border: 1px solid rgba(255,255,255,0.05); }
.poster-wrapper img { width: 100%; height: 100%; object-fit: cover; -webkit-user-drag: none; }

.placeholder { height: 100%; display: flex; align-items: center; justify-content: center; background: #1a1a1a; }
.placeholder span { font-size: 2rem; color: #262626; font-weight: 900; letter-spacing: -1px; }

.overlay-mobile { position: absolute; bottom: 5px; left: 5px; z-index: 2; }
.year-label { color: #fff; font-weight: 900; font-size: 0.6rem; background: var(--primary); padding: 2px 5px; border-radius: 3px; }

.info { margin-top: 8px; cursor: pointer; }
.info h3 { 
    color: #fff; font-size: 0.8rem; font-weight: 700; margin: 0; line-height: 1.2; text-transform: none;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    user-select: text; -webkit-user-select: text; transition: color 0.2s ease;
}

.original-name { 
    color: #888; font-size: 0.72rem; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    user-select: text; -webkit-user-select: text; font-weight: 500; transition: all 0.2s ease;
}

.movie-card:hover .original-name { color: #ccc; }
.movie-card:hover h3 { color: var(--primary); }

.loader-scrolling { text-align: center; padding: 40px; color: #444; font-weight: 800; font-size: 0.8rem; text-transform: none; letter-spacing: 2px; }

/* RESPONSIVE */
@media (max-width: 1000px) { .titles-grid { grid-template-columns: repeat(4, 1fr); gap: 20px 12px; } .title-area h1 { font-size: 2.2rem; } }
@media (max-width: 700px) {
  .centered-wrapper { padding: 20px 10px; }
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; margin-bottom: 25px; }
  .title-area h1 { font-size: 1.8rem; }
  .controls { width: 100%; gap: 10px; }
  .select-group { flex: 1; }
  select { min-width: 0; width: 100%; padding: 8px; font-size: 0.75rem; }
  .titles-grid { grid-template-columns: repeat(3, 1fr); gap: 15px 8px; }
}
@media (max-width: 450px) { .info h3 { font-size: 0.7rem; } .titles-grid { gap: 10px 6px; } }
</style>