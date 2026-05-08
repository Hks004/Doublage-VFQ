<script setup>
import { ref, onMounted, provide, computed } from 'vue'
import { useRouter } from 'vue-router'

const allData = ref([])
const isLoaded = ref(false)
const searchQuery = ref('')
const showResults = ref(false)
const router = useRouter()

// --- LOGIQUE MENU ---
const isMenuOpen = ref(false)
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }
const closeMenu = () => { isMenuOpen.value = false }

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data.json?t=${Date.now()}`)
    allData.value = await response.json()
    isLoaded.value = true
  } catch (error) {
    console.error("Erreur:", error)
  }
})

const getPosterUrl = (posterPath) => {
  if (!posterPath) return null
  return `https://image.tmdb.org/t/p/w92${posterPath}`
}

const liveResults = computed(() => {
  const s = searchQuery.value.toLowerCase().trim()
  if (s.length < 1) return { movies: [], vfq: [], actors: [] }
  
  const movies = []
  const vfqSet = new Set()
  const actorSet = new Set()

  allData.value.forEach(m => {
    if ((m.translatedName?.toLowerCase().includes(s) || m.originalName?.toLowerCase().includes(s)) && movies.length < 15) {
      movies.push(m)
    }
    m.cast?.forEach(c => {
      const vfqName = c.doubleVFQ?.trim() || ""
      const actorName = c.actor?.trim() || ""
      if (vfqName.toLowerCase().includes(s) && vfqName !== "À confirmer") vfqSet.add(vfqName)
      if (actorName.toLowerCase().includes(s)) actorSet.add(actorName)
    })
  })

  return { movies, vfq: Array.from(vfqSet).slice(0, 8), actors: Array.from(actorSet).slice(0, 8) }
})

const selectMovie = (id) => {
  searchQuery.value = ''; showResults.value = false; router.push(`/film/${id}`)
}

// LOGIQUE CORRIGÉE : Redirige vers /acteur ou /doubleur selon le type
const selectPerson = (name, type) => {
  searchQuery.value = ''; 
  showResults.value = false; 
  if (type === 'actor') {
    router.push(`/acteur/${name}`)
  } else {
    router.push(`/doubleur/${name}`)
  }
}

provide('database', allData)
provide('isLoaded', isLoaded)
</script>

<template>
  <div id="layout" @click="showResults = false">
    <nav class="nav">
      <div class="nav-content">
        <div class="nav-header">
          <router-link to="/" class="logo" @click="closeMenu">⚜ Doublage<span>VFQ</span></router-link>
          <button class="hamburger" :class="{ 'is-active': isMenuOpen }" @click.stop="toggleMenu">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div class="search-wrapper" @click.stop>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchQuery" type="text" placeholder="Film, série, acteur ou doubleur..." @focus="showResults = true">
          </div>

          <transition name="fade">
            <div v-if="showResults && (liveResults.movies.length > 0 || liveResults.vfq.length > 0 || liveResults.actors.length > 0)" class="search-dropdown">
              <div v-if="liveResults.vfq.length > 0" class="search-section">
                <div class="section-label">Doubleurs VFQ</div>
                <div v-for="name in liveResults.vfq" :key="'vfq-'+name" class="dropdown-item person-item" @click="selectPerson(name, 'vfq')">
                  <div class="person-icon vfq-icon">⚜</div>
                  <div class="item-info"><div class="item-title">{{ name }}</div></div>
                </div>
              </div>
              <div v-if="liveResults.actors.length > 0" class="search-section">
                <div class="section-label">Acteurs Originaux</div>
                <div v-for="name in liveResults.actors" :key="'act-'+name" class="dropdown-item person-item" @click="selectPerson(name, 'actor')">
                  <div class="person-icon">👤</div>
                  <div class="item-info"><div class="item-title">{{ name }}</div></div>
                </div>
              </div>
              <div v-if="liveResults.movies.length > 0" class="search-section">
                <div class="section-label">Films & Séries</div>
                <div v-for="movie in liveResults.movies" :key="movie.movieId" class="dropdown-item" @click="selectMovie(movie.movieId)">
                  <img v-if="movie.posterPath" :src="getPosterUrl(movie.posterPath)" class="item-poster">
                  <div v-else class="item-poster-placeholder">VFQ</div>
                  <div class="item-info">
                    <div class="item-title">{{ movie.translatedName }}</div>
                    <div class="item-sub">{{ movie.originalName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="links" :class="{ 'is-open': isMenuOpen }">
          <router-link to="/catalogue" @click="closeMenu">Tout</router-link> 
          <router-link to="/films" @click="closeMenu">Films</router-link>
          <router-link to="/series" @click="closeMenu">Séries</router-link>
          <router-link to="/animation" @click="closeMenu">Animation</router-link>
          <router-link to="/comediens" @click="closeMenu">Comédiens</router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-container" @click="closeMenu">
      <router-view v-if="isLoaded" />
      <div v-else class="page-loading">Chargement de la base VFQ...</div>
    </main>

    <footer v-if="isLoaded" class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <router-link to="/" class="logo-small">⚜ Doublage<span>VFQ</span></router-link>
          <p class="copyright">&copy; 2026 • Tous droits réservés</p>
        </div>
        <div class="footer-nav">
          <router-link to="/catalogue">Tout</router-link>
          <router-link to="/films">Films</router-link>
          <router-link to="/series">Séries</router-link>
          <router-link to="/animation">Animation</router-link>
          <router-link to="/comediens">Comédiens</router-link>
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* --- TON STYLE ORIGINAL PRÉSERVÉ --- */
:root {
  --primary: #2563eb;
  --bg: #0a0a0a;
  --nav-bg: #111111;
  --text: #ffffff;
  --text-muted: #666;
}
body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
#layout { display: flex; flex-direction: column; min-height: 100vh; }
.main-container { flex: 1; }

.nav { height: 70px; background: var(--nav-bg); border-bottom: 1px solid #262626; position: sticky; top: 0; z-index: 1000; display: flex; align-items: center; }
.nav-content { max-width: 1400px; margin: 0 auto; width: 100%; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; position: relative; }
.nav-header { display: flex; align-items: center; justify-content: space-between; }

.logo { font-size: 1.3rem; font-weight: 800; text-decoration: none; color: white; flex-shrink: 0; }
.logo span { color: var(--primary); }

.search-wrapper { position: relative; width: 500px; margin: 0 20px; }
.search-bar { background: #1a1a1a; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; }
.search-bar input { background: transparent; border: none; color: white; outline: none; width: 100%; font-size: 0.95rem; }

.links { display: flex; gap: 20px; flex-shrink: 0; }
.links a { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: 0.2s; }
.links a:hover, .links a.router-link-active { color: var(--primary); }

.search-dropdown { position: absolute; top: calc(100% + 10px); left: 0; width: 100%; max-height: 600px; background: #151515; border: 1px solid #333; border-radius: 8px; overflow-y: auto; z-index: 1001; }
.search-section { padding: 10px 0; border-bottom: 1px solid #262626; }
.section-label { padding: 5px 15px 10px; font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
.dropdown-item { display: flex; align-items: center; padding: 10px 15px; cursor: pointer; gap: 15px; }
.dropdown-item:hover { background: #1e1e1e; }
.item-poster { width: 40px; height: 58px; border-radius: 4px; object-fit: cover; }
.person-icon { width: 40px; height: 40px; background: #222; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.vfq-icon { color: var(--primary); border: 1px solid var(--primary); }

.footer { background: var(--nav-bg); border-top: 1px solid #262626; padding: 40px 20px; margin-top: 60px; }
.footer-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.logo-small { text-decoration: none; color: white; font-weight: 800; font-size: 1.1rem; }
.logo-small span { color: var(--primary); }
.copyright { color: #444; font-size: 0.75rem; margin: 5px 0 0 0; font-weight: 600; }
.footer-nav { display: flex; gap: 20px; }
.footer-nav a { color: var(--text-muted); text-decoration: none; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }
.hamburger span { width: 22px; height: 2px; background: white; transition: 0.3s; }
.hamburger.is-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.is-active span:nth-child(2) { opacity: 0; }
.hamburger.is-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 950px) {
  .nav-content { flex-direction: column; align-items: stretch; height: auto; padding: 15px 20px; }
  .nav-header { width: 100%; display: flex; justify-content: space-between; margin-bottom: 10px; }
  .hamburger { display: flex; }
  .search-wrapper { width: 100%; margin: 0; }
  .links {
    position: absolute; top: 100%; right: 20px; left: 20px; width: auto; 
    background: #161616; flex-direction: column; padding: 15px; gap: 5px; 
    border-radius: 12px; border: 1px solid #333; opacity: 0; 
    transform: translateY(-10px); pointer-events: none; transition: 0.3s; z-index: 2000;
  }
  .links.is-open { opacity: 1; transform: translateY(10px); pointer-events: auto; }
  .links a { padding: 12px; border-bottom: 1px solid #222; width: 100%; box-sizing: border-box; }
  .footer-content { flex-direction: column; gap: 20px; text-align: center; }
  .footer-nav { flex-wrap: wrap; justify-content: center; }
}
</style>