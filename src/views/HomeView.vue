<script setup>
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'

const allData = inject('database')
const isLoaded = inject('isLoaded')
const router = useRouter()

const derniersAjouts = computed(() => {
  if (!allData.value) return []
  return [...allData.value].slice(-5).reverse()
})

const topComediens = computed(() => {
  if (!allData.value) return []
  const counts = {}
  allData.value.forEach(m => {
    m.cast?.forEach(c => {
      if (c.doubleVFQ && c.doubleVFQ.trim() !== "" && c.doubleVFQ !== "À confirmer") {
        const nom = c.doubleVFQ.trim()
        counts[nom] = (counts[nom] || 0) + 1
      }
    })
  })
  return Object.keys(counts)
    .map(nom => ({ nom, count: counts[nom] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) 
})

const navigateSafely = (e, route) => {
  // Empêche la navigation au clic gauche si du texte est sélectionné
  const selection = window.getSelection().toString()
  if (selection.length > 0) {
    e.preventDefault()
    return
  }
  // Le clic milieu (bouton 1) est ignoré par router.push pour laisser le navigateur ouvrir l'onglet
  if (e.button !== 1) {
    router.push(route)
  }
}

const getPosterUrl = (path) => path ? `https://image.tmdb.org/t/p/w300${path}` : null

const extractYear = (m) => {
  const val = m.theatricalRelease || m.extra?.theatricalRelease
  if (!val) return '----'
  const match = val.toString().match(/\d{4}/)
  return match ? match[0] : '----'
}
</script>

<template>
  <div class="home-page">
    <div v-if="isLoaded" class="container">
      
      <section class="hero-section">
        <h1>Bienvenue sur ⚜ Doublage<span>VFQ</span></h1>
        <p>Votre base de données de référence pour le doublage québécois. Retrouvez les fiches de vos films, séries et comédiens préférés.</p>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">DERNIERS AJOUTS</h2>
          <router-link to="/catalogue" class="btn-voir-tout">VOIR TOUT</router-link>
        </div>
        
        <div class="grid-posters">
          <router-link 
            v-for="m in derniersAjouts" 
            :key="m.movieId" 
            :to="'/film/' + m.movieId"
            @click.native="navigateSafely($event, '/film/' + m.movieId)"
            class="poster-card"
            draggable="false"
          >
            <div class="poster-img-wrapper" draggable="false">
              <img v-if="m.posterPath" :src="getPosterUrl(m.posterPath)" :alt="m.translatedName" loading="lazy" draggable="false">
              <div v-else class="poster-placeholder">VFQ</div>
            </div>
            <div class="poster-info">
              <span class="movie-title">{{ m.translatedName }}</span>
              <span class="movie-original">{{ m.originalName }}</span>
              <span class="movie-year">{{ extractYear(m) }}</span>
            </div>
          </router-link>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">COMÉDIENS LES PLUS ACTIFS</h2>
          <router-link to="/comediens" class="btn-voir-tout">VOIR TOUT</router-link>
        </div>

        <div class="grid-comediens">
          <router-link 
            v-for="(c, index) in topComediens" 
            :key="c.nom" 
            :to="'/doubleur/' + c.nom"
            @click.native="navigateSafely($event, '/doubleur/' + c.nom)"
            class="comedien-card"
            draggable="false"
          >
            <span class="rank">{{ index + 1 }}</span>
            <div class="comedien-info">
              <span class="comedien-name">{{ c.nom }}</span>
              <span class="comedien-stats">{{ c.count }} FICHES</span>
            </div>
            <span class="arrow">→</span>
          </router-link>
        </div>
      </section>

    </div>
    
    <div v-else class="loader">
      <div class="spinner"></div>
      <p>Chargement de l'accueil...</p>
    </div>
  </div>
</template>

<style scoped>
/* --- TON STYLE ORIGINAL PRÉSERVÉ À 100% --- */
.home-page { padding: 40px 20px; }
.container { max-width: 1400px; margin: 0 auto; }

.movie-original { 
  display: block; 
  color: #555; 
  font-size: 0.75rem; 
  font-weight: 600; 
  font-style: italic; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  transition: color 0.3s;
}

.poster-card:hover .movie-title { color: var(--primary); }
.poster-card:hover .movie-original { color: #888; }

.hero-section { margin-bottom: 60px; border-left: 4px solid var(--primary); padding-left: 20px; }
.hero-section h1 { font-size: 2.2rem; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase; }
.hero-section h1 span { color: var(--primary); }
.hero-section p { color: var(--text-muted); font-size: 1.1rem; max-width: 800px; margin: 0; line-height: 1.6; }

.section { margin-bottom: 60px; }
.section-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 25px;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 15px;
}
.section-title { 
  font-size: 1.2rem; 
  font-weight: 900; 
  letter-spacing: 2px; 
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
}
.section-title::before {
  content: ""; width: 20px; height: 2px; background: var(--primary); margin-right: 15px;
}

.btn-voir-tout {
  background: #111; border: 1px solid #333; color: var(--text-muted); padding: 6px 15px; border-radius: 4px;
  font-size: 0.75rem; font-weight: 800; text-decoration: none; transition: 0.2s;
}
.btn-voir-tout:hover { background: var(--primary); color: white; border-color: var(--primary); }

.grid-posters {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.poster-card { text-decoration: none; transition: transform 0.3s; }
.poster-card:hover { transform: translateY(-10px); }

.poster-img-wrapper {
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #262626;
  background: #1a1a1a;
  margin-bottom: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}
.poster-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.poster-placeholder { 
  height: 100%; display: flex; align-items: center; justify-content: center; 
  font-weight: 900; color: #333; font-size: 1.5rem; 
}

.movie-title { display: block; color: white; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s; }
.movie-year { display: block; color: var(--primary); font-size: 0.8rem; font-weight: 800; }

.grid-comediens {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.comedien-card {
  background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 15px 20px;
  display: flex; align-items: center; text-decoration: none; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.comedien-card:hover { background: #161616; border-color: var(--primary); transform: translateX(8px); }
.rank { font-size: 1.2rem; font-weight: 900; color: var(--primary); margin-right: 20px; opacity: 0.5; width: 25px; }
.comedien-info { flex: 1; }
.comedien-name { display: block; color: white; font-weight: 700; font-size: 1rem; }
.comedien-stats { display: block; color: #555; font-size: 0.75rem; font-weight: 800; margin-top: 2px; text-transform: uppercase; }
.arrow { color: #222; font-size: 1.2rem; transition: 0.2s; }
.comedien-card:hover .arrow { color: var(--primary); transform: translateX(3px); }

.loader { text-align: center; padding: 100px; color: var(--primary); font-weight: 800; }
.spinner { width: 40px; height: 40px; border: 4px solid #262626; border-top: 4px solid var(--primary); border-radius: 50%; margin: 0 auto 15px; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 1200px) { .grid-posters { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px) { .grid-posters { grid-template-columns: repeat(3, 1fr); } .grid-comediens { grid-template-columns: repeat(2, 1fr); } .hero-section h1 { font-size: 1.8rem; } }
@media (max-width: 650px) {
  .home-page { padding: 20px 15px; }
  .grid-posters { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .grid-comediens { grid-template-columns: 1fr; }
  .movie-title { white-space: normal; line-height: 1.2; height: 2.4em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
}
@media (max-width: 400px) { .hero-section h1 { font-size: 1.4rem; } .grid-posters { gap: 10px; } }
</style>