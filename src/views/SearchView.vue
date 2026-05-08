<script setup>
import { ref, inject, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const items = inject('database')

// q est lié à l'URL
const q = ref(route.query.q || '')

// On écoute les changements d'URL (barre du haut)
watch(() => route.query.q, (newVal) => {
  q.value = newVal || ''
})

// Si on tape dans la barre du milieu, on met à jour l'URL
watch(q, (newVal) => {
  router.replace({ query: { ...route.query, q: newVal } })
})

const results = computed(() => {
  const s = q.value.toLowerCase().trim()
  if (s.length < 2) return []
  
  return items.value.filter(m => 
    m.translatedName?.toLowerCase().includes(s) || 
    m.originalName?.toLowerCase().includes(s)
  ).slice(0, 50)
})
</script>

<template>
  <div class="page">
    <div class="search-container">
      <input 
        v-model="q" 
        type="text" 
        placeholder="Entrez le nom d'un film ou d'un acteur..." 
        autofocus
      >
      <p class="search-hint" v-if="q.length > 0 && q.length < 2">Continuez à taper...</p>
    </div>

    <div class="results-list" v-if="results.length > 0">
      <router-link 
        v-for="m in results" 
        :key="m.movieId" 
        :to="'/film/'+m.movieId" 
        class="result-item"
      >
        <div class="result-info">
          <h3>{{ m.translatedName }}</h3>
          <p>{{ m.originalName }}</p>
        </div>
        <span class="result-type" v-if="m.extra?.projectType">{{ m.extra.projectType }}</span>
      </router-link>
    </div>

    <div class="no-results" v-else-if="q.length >= 2">
      Aucun résultat trouvé pour "{{ q }}"
    </div>
  </div>
</template>

<style scoped>
.search-container { margin-bottom: 30px; }
input {
  width: 100%; 
  padding: 18px 25px; 
  background: #171717; 
  color: white; 
  border: 2px solid #262626; 
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: 0.2s;
}
input:focus { border-color: #2563eb; background: #1e1e1e; }

.search-hint { margin-top: 10px; color: #666; font-size: 0.9rem; }

.results-list { display: flex; flex-direction: column; gap: 10px; }

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #171717;
  padding: 15px 20px;
  border-radius: 10px;
  border-left: 4px solid #2563eb;
  text-decoration: none;
  color: white;
  transition: 0.2s;
}
.result-item:hover { background: #262626; transform: translateX(5px); }

.result-info h3 { margin: 0; color: #2563eb; font-size: 1.1rem; }
.result-info p { margin: 5px 0 0; opacity: 0.6; font-size: 0.9rem; font-style: italic; }

.result-type { 
  background: #262626; 
  padding: 4px 10px; 
  border-radius: 6px; 
  font-size: 0.75rem; 
  color: #a3a3a3; 
  text-transform: uppercase; 
}

.no-results { text-align: center; color: #666; padding: 40px; }
</style>