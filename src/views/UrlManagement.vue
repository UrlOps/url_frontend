<template>
  <div class="relative w-full h-screen overflow-hidden bg-black">
    <!-- Background -->
    <Galaxy 
      :mouse-repulsion="true"
      :mouse-interaction="true"
      :density="1.5"
      :glow-intensity="0.5"
      :saturation="0.8"
      :hue-shift="240"
      class="absolute top-0 left-0 w-full h-full z-0"
    />

    <!-- UI Elements -->
    <transition name="fade">
      <div v-if="showUI" class="absolute top-0 left-0 z-10 flex flex-col w-full h-full pointer-events-none">
        <!-- Header -->
        <header class="flex items-center justify-between p-4 mx-auto mt-5 w-full max-w-6xl text-white bg-black bg-opacity-20 rounded-full backdrop-blur-sm border border-gray-800 pointer-events-auto">
          <div class="flex items-center ml-4">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            <span class="text-xl font-semibold">URL Shortener</span>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex flex-col items-center justify-center flex-grow px-4 text-center">
          <h1 class="text-5xl font-bold text-white md:text-6xl pointer-events-auto" style="text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);">Shorten Your Links</h1>
          <p class="max-w-2xl mt-4 text-lg text-gray-300 pointer-events-auto">Enter any long URL to generate a short, shareable link in seconds.</p>
          
          <form @submit.prevent="createShortUrl" class="flex w-full max-w-xl mx-auto mt-12 pointer-events-auto">
            <input 
              type="text" 
              v-model="originalUrl" 
              placeholder="https://your-long-url.com/goes-here" 
              class="flex-grow p-4 text-lg text-white placeholder-gray-500 bg-gray-900 border border-r-0 border-gray-700 rounded-l-full bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              class="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              Shorten
            </button>
          </form>

          <!-- URL List -->
          <div class="w-full max-w-4xl mt-8 overflow-y-auto max-h-48 pointer-events-auto" v-if="urls.length > 0">
            <ul class="space-y-4">
              <li v-for="url in urls" :key="url.id" 
                  class="p-4 text-left text-white transition-all duration-300 bg-gray-900 bg-opacity-50 border border-gray-800 rounded-lg backdrop-blur-sm hover:bg-opacity-70 hover:border-gray-700">
                <p class="mb-2 truncate">
                  <span class="font-semibold text-gray-400">Original:</span> 
                  <span class="ml-2 text-gray-300">{{ url.originalUrl }}</span>
                </p>
                <p>
                  <span class="font-semibold text-gray-400">Short:</span> 
                  <a :href="getFullShortUrl(url.shortUrl)" target="_blank" class="ml-2 text-blue-400 hover:underline">{{ getFullShortUrl(url.shortUrl) }}</a>
                </p>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </transition>

    <!-- Toggle Switch -->
    <div class="absolute bottom-5 right-5 z-20 flex items-end space-x-2 text-white pointer-events-auto">
      <span class="text-sm">UI</span>
      <v-switch
        v-model="showUI"
        color="success"
        inset
        dense
        hide-details
      />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';
import Galaxy from '../components/Galaxy.vue';

const showUI = ref(true);
const toggleUI = () => {
  showUI.value = !showUI.value;
};

const originalUrl = ref('');
const urls = ref([]);

const fetchUrls = async () => {
  try {
    const response = await apiClient.get('/urls');
    urls.value = response.data.reverse();
  } catch (error) {
    console.error(error);
  }
};

const createShortUrl = async () => {
  if (!originalUrl.value.trim()) return;
  try {
    const response = await apiClient.post('/urls', { originalUrl: originalUrl.value });
    urls.value.unshift(response.data);
    originalUrl.value = '';
  } catch (error) {
    console.error(error);
  }
};

const getFullShortUrl = (shortUrl) => {
  return `http://localhost:8080/r/${shortUrl}`;
};

onMounted(fetchUrls);
</script>
