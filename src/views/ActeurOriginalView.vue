<script setup>
import { inject, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const items = inject('database')
const isLoaded = inject('isLoaded')

const name = ref(route.params.name)
const openGroups = ref({})

watch(() => route.params.name, (newName) => {
  name.value = newName
  openGroups.value = {}
})

const groupedPerformances = computed(() => {
  const groups = {}
  if (!items.value) return []

  items.value.forEach(movie => {
    movie.cast?.forEach(c => {
      if (c.actor === name.value) {
        const doubleur = c.doubleVFQ || 'Non crédité'
        if (!groups[doubleur]) groups[doubleur] = []
        groups[doubleur].push({
          title: movie.translatedName,
          id: movie.movieId,
          role: c.role,
          year: movie.extra?.theatricalRelease || 'N/A'
        })
      }
    })
  })

  return Object.keys(groups).map(vfqName => ({
    vfqName,
    movies: groups[vfqName].sort((a, b) => b.year.localeCompare(a.year)),
    count: groups[vfqName].length
  })).sort((a, b) => b.count - a.count)
})

const toggleGroup = (vfq) => {
  openGroups.value[vfq] = !openGroups.value[vfq]
}
</script>

<template>
  <div class="page" v-if="isLoaded">
    <div class="nav-container">
      <a href="#" @click.prevent="$router.back()" class="back-link">← RETOUR</a>
    </div>

    <div class="header">
      <p class="category-prefix">ACTEUR ORIGINAL</p>
      <h1>{{ name }}</h1>
      <div class="title-underline"></div>
    </div>

    <div class="groups-container">
      <div v-for="group in groupedPerformances" :key="group.vfqName" class="actor-group">
        <div class="group-header" @click="toggleGroup(group.vfqName)">
          <div class="info">
            <span class="prefix">DOUBLÉ PAR</span>
            <span class="vfq-name">{{ group.vfqName }}</span>
          </div>
          <div class="right-section">
            <span class="role-count">
              {{ group.count }} projet{{ group.count > 1 ? 's' : '' }}
            </span>
            <span class="chevron" :class="{ 'is-open': openGroups[group.vfqName] }">▼</span>
          </div>
        </div>

        <transition name="slide">
          <div v-if="openGroups[group.vfqName]" class="group-content">
            <router-link v-for="m in group.movies" :key="m.id" :to="'/film/' + m.id" class="movie-row">
              <div class="m-main">
                <span class="m-title">{{ m.title }}</span>
                <span class="m-role">{{ m.role }}</span>
              </div>
              <span class="m-year">{{ m.year }}</span>
            </router-link>
          </div>
        </transition>
      </div>
    </div>
  </div>
  <div v-else class="loader">Chargement...</div>
</template>

<style scoped>
/* --- VERSION ORDINATEUR (STYLE ORIGINAL) --- */
.page { max-width: 1000px; margin: 40px auto; padding: 0 20px; color: #fff; }

.nav-container { margin-bottom: 20px; }
.back-link { color: #666; text-decoration: none; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; transition: color 0.2s; }
.back-link:hover { color: var(--primary); }

.header { margin-bottom: 50px; }
.category-prefix { color: var(--primary); font-weight: 800; font-size: 0.75rem; letter-spacing: 2px; margin-bottom: 5px; }
h1 { font-size: 4rem; font-weight: 900; margin: 0; text-transform: uppercase; line-height: 1; }
.title-underline { width: 120px; height: 6px; background: var(--primary); margin-top: 10px; }

.groups-container { display: flex; flex-direction: column; gap: 15px; }

.group-header { 
  background: rgba(255, 255, 255, 0.03); 
  padding: 25px 30px; 
  border-radius: 15px; 
  cursor: pointer; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s ease;
}
.group-header:hover { background: rgba(255, 255, 255, 0.06); }

.info { display: flex; align-items: center; gap: 15px; }
.prefix { color: var(--primary); font-weight: 900; font-style: italic; font-size: 1.1rem; }
.vfq-name { color: #fff; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 1.3rem; letter-spacing: 1px; }

.right-section { display: flex; align-items: center; gap: 20px; }
.role-count { background: rgba(37, 99, 235, 0.15); color: var(--primary); padding: 4px 15px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; white-space: nowrap; }
.chevron { color: #444; transition: 0.3s; font-size: 0.8rem; }
.chevron.is-open { transform: rotate(180deg); color: var(--primary); }

.group-content { 
  background: rgba(0, 0, 0, 0.2); 
  margin: -5px 10px 10px 10px; 
  border-radius: 0 0 15px 15px; 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  border-top: none; 
  overflow: hidden; 
}

.movie-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 15px 25px; 
  text-decoration: none; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}
.movie-row:hover { background: rgba(37, 99, 235, 0.05); }

.m-main { display: flex; flex-direction: column; gap: 2px; }
.m-title { color: #fff; font-weight: 700; font-size: 1rem; transition: color 0.2s; }
.movie-row:hover .m-title { color: var(--primary); }
.m-role { color: #666; font-size: 0.85rem; font-style: italic; }
.m-year { color: #444; font-weight: 800; font-size: 0.8rem; }

/* --- ANIMATIONS --- */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease-out; max-height: 2000px; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-10px); }

.loader { text-align: center; padding: 100px; color: var(--primary); font-weight: 900; }

/* --- RESPONSIVE (STYLE COMPACT) --- */
@media (max-width: 768px) {
  .page { margin: 20px auto; padding: 0 10px; }
  h1 { font-size: 2.5rem; }
  .header { margin-bottom: 30px; }
  .title-underline { width: 80px; height: 4px; }
  
  .group-header { padding: 12px 18px; border-radius: 10px; }
  .info { flex-direction: column; align-items: flex-start; gap: 0; }
  .prefix { font-size: 0.65rem; }
  .vfq-name { font-size: 1rem; }
  
  .right-section { gap: 10px; }
  .role-count { font-size: 0.65rem; padding: 3px 10px; }

  .group-content { margin: -5px 5px 10px 5px; border-radius: 0 0 10px 10px; }
  .movie-row { padding: 10px 15px; }
  .m-title { font-size: 0.85rem; }
  .m-role { font-size: 0.75rem; }
  .m-year { font-size: 0.7rem; }
}
</style>