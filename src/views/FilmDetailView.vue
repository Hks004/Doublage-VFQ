<script setup>
import { inject, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const items = inject('database')
const isLoaded = inject('isLoaded')

const goBack = () => {
  router.back()
}

const movie = computed(() => {
  if (!items.value) return null
  return items.value.find(m => m.movieId == route.params.id)
})

const getPoster = (m) => {
  const baseUrl = 'https://image.tmdb.org/t/p/w500'
  const path = m.posterPath || m.extra?.posterPath
  return path ? (baseUrl + path) : null
}
</script>

<template>
  <div class="page-detail" v-if="isLoaded && movie">
    <div class="nav-container">
      <a href="#" @click.prevent="goBack" class="back-link">← RETOUR</a>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div class="poster-wrapper">
          <img v-if="getPoster(movie)" :src="getPoster(movie)" class="main-poster" />
          <div v-else class="main-poster-placeholder"><span>VFQ</span></div>
        </div>
      </div>

      <div class="details-area">
        <header class="movie-header">
          <h1>{{ movie.translatedName }}</h1>
          <div class="sub-header">
            <span class="original-title">{{ movie.originalName }}</span>
            <span class="separator">|</span>
            <span class="release-date">{{ movie.extra?.theatricalRelease || 'DATE INCONNUE' }}</span>
          </div>
        </header>

        <section class="synopsis-section" v-if="movie.description">
          <h2 class="section-label">SYNOPSIS</h2>
          <p class="synopsis-text">{{ movie.description }}</p>
        </section>

        <h2 class="section-label">DISTRIBUTION VFQ</h2>
        <div class="cast-table-wrapper">
          <table class="cast-table">
            <thead>
              <tr>
                <th class="col-actor">ACTEUR ORIGINAL</th>
                <th class="col-role">RÔLE</th>
                <th class="col-doubleur">DOUBLEUR</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in movie.cast" :key="c.actor">
                <td class="actor-orig">
                  <router-link :to="'/acteur/' + c.actor" class="actor-link">{{ c.actor }}</router-link>
                </td>
                <td class="role-name">({{ c.role }})</td>
                <td class="vfq-actor">
                  <router-link 
                    :to="'/doubleur/' + encodeURIComponent(c.doubleVFQ)" 
                    class="vfq-link"
                  >
                    {{ c.doubleVFQ }}
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="technical-sheet" v-if="movie.extra">
          <h2 class="section-label">FICHE TECHNIQUE VFQ</h2>
          <div class="tech-grid">
            <div class="tech-item" v-if="movie.extra.studio">
              <span class="label">STUDIO</span>
              <span class="value">{{ movie.extra.studio }}</span>
            </div>
            <div class="tech-item" v-if="movie.extra.director">
              <span class="label">DIRECTION</span>
              <span class="value">{{ movie.extra.director }}</span>
            </div>
            <div class="tech-item" v-if="movie.extra.adapter">
              <span class="label">ADAPTATION</span>
              <span class="value">{{ movie.extra.adapter }}</span>
            </div>
            <div class="tech-item" v-if="movie.extra.distributor">
              <span class="label">DISTRIBUTEUR</span>
              <span class="value">{{ movie.extra.distributor }}</span>
            </div>
            <div class="tech-item" v-if="movie.extra.producer">
              <span class="label">PRODUCTEUR</span>
              <span class="value">{{ movie.extra.producer }}</span>
            </div>
            <div class="tech-item" v-if="movie.extra.theatricalRelease">
              <span class="label">SORTIE</span>
              <span class="value">{{ movie.extra.theatricalRelease }}</span>
            </div>
            <div class="tech-item" v-if="movie.extra.dvdRelease">
              <span class="label">SORTIE DVD</span>
              <span class="value">{{ movie.extra.dvdRelease }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loader">Chargement...</div>
</template>

<style scoped>
.page-detail { max-width: 1200px; margin: 0 auto; padding: 40px 20px; color: #fff; }
.nav-container { margin-bottom: 30px; }
.back-link { color: #667085; text-decoration: none; font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: color 0.2s; }
.back-link:hover { color: var(--primary); }

.main-content { display: flex; gap: 50px; }
.sidebar { width: 300px; flex-shrink: 0; }
.poster-wrapper { border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
.main-poster { width: 100%; display: block; }
.main-poster-placeholder { width: 100%; aspect-ratio: 2/3; background: #171717; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 900; color: #262626; }

.movie-header h1 { font-size: 3.5rem; font-weight: 900; margin: 0; text-transform: none; line-height: 1; }
.sub-header { margin-top: 15px; font-size: 1.1rem; color: #888; display: flex; gap: 15px; align-items: center; }
.separator { opacity: 0.3; }
.release-date { font-weight: 800; color: #fff; font-size: 0.9rem; letter-spacing: 1px; }

.section-label { font-size: 0.7rem; font-weight: 800; color: #667085; letter-spacing: 2px; margin: 40px 0 20px 0; display: flex; align-items: center; gap: 10px; }
.section-label::before { content: ""; width: 20px; height: 1px; background: #333; }

.synopsis-text { font-size: 1.05rem; line-height: 1.6; color: #ccc; font-style: italic; max-width: 850px; }

.cast-table-wrapper { margin-top: 30px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
.cast-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.cast-table th { padding: 15px 20px; font-size: 0.65rem; color: #667085; border-bottom: 1px solid rgba(255,255,255,0.05); text-transform: uppercase; }
.cast-table td { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.95rem; }

.col-actor { text-align: left; width: 35%; }
.col-role { text-align: center; width: 30%; }
.col-doubleur { text-align: right; width: 35%; }

.actor-orig { text-align: left; }
.role-name { text-align: center; color: #888; font-style: italic; }
.vfq-actor { text-align: right; }

.actor-link, .vfq-link { color: var(--primary); text-decoration: none; font-weight: 600; }
.actor-link:hover, .vfq-link:hover { text-decoration: underline; }

.technical-sheet { margin-top: 50px; background: rgba(255,255,255,0.02); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
.tech-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.tech-item { display: flex; flex-direction: column; gap: 4px; }
.tech-item .label { font-size: 0.6rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
.tech-item .value { font-size: 1rem; font-weight: 700; color: #fff; }

@media (max-width: 900px) {
  .main-content { flex-direction: column; align-items: center; }
  .sidebar { width: 100%; max-width: 250px; margin-bottom: 20px; }
  .movie-header h1 { font-size: 2.2rem; text-align: center; }
  .sub-header { justify-content: center; }
  .synopsis-text { text-align: center; }
  .section-label { justify-content: center; }
  .tech-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .page-detail { padding: 20px 10px; }
  .cast-table th, .cast-table td { padding: 10px 8px; font-size: 0.7rem; }
  .role-name { font-size: 0.65rem; }
  .tech-grid { grid-template-columns: 1fr; }
}
</style>