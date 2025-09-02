<script setup>
import { ref } from 'vue';
import apiClient from '../services/api';
import Galaxy from '../components/Galaxy.vue';

const showUI = ref(true);
const toggleUI = () => {
  showUI.value = !showUI.value;
};

const originalUrl = ref('');
const isModalVisible = ref(false);
const newlyCreatedUrl = ref(null);
const copySuccess = ref(false);

const createShortUrl = async () => {
  if (!originalUrl.value.trim()) return;
  try {
    const response = await apiClient.post('/api/urls', { originalUrl: originalUrl.value });
    const newUrl = response.data.data;
    newlyCreatedUrl.value = newUrl;
    isModalVisible.value = true;
    originalUrl.value = '';
  } catch (error) {
    console.error(error);
  }
};

const copyToClipboard = () => {
  if (newlyCreatedUrl.value?.shortenUrl) {
    navigator.clipboard.writeText(newlyCreatedUrl.value.shortenUrl);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  }
};

</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-black">
    <!-- Background -->
    <Galaxy 
      class="absolute top-0 left-0 w-full h-full z-0"
    />

    <!-- UI Elements -->
    <transition name="fade">
      <div v-if="showUI" class="absolute top-0 left-0 z-10 flex flex-col w-full h-full pointer-events-none">
        <!-- Main Content -->
        <main class="flex flex-col items-center justify-center flex-grow px-4 text-center">
          <h1 class="text-5xl font-bold text-white md:text-6xl pointer-events-auto" style="text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);">Shorten Your Links</h1>
          <p class="max-w-2xl mt-4 text-lg text-gray-300 pointer-events-auto">Enter any long URL to generate a short, shareable link in seconds.</p>
          
          <form @submit.prevent="createShortUrl" class="flex w-full w-xl mx-auto mt-12 pointer-events-auto custom-form">
            <input 
              type="text" 
              v-model="originalUrl" 
              placeholder="https://your-long-url.com/goes-here" 
              class="pa-4 flex-grow p-4 text-lg text-white placeholder-gray-500 bg-gray-900 border border-r-0 border-gray-700 rounded-l-full bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              class="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              Shorten
            </button>
          </form>
        </main>
      </div>
    </transition>

    <!-- Shortened URL Modal -->
    <v-dialog v-model="isModalVisible" max-width="500" theme="dark">
      <v-card class="bg-gray-900 border border-gray-800">
        <v-card-title class="text-h5 text-white">
          Short URL Created!
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-gray-300">Your shortened URL is ready to be shared:</p>
          <v-text-field
            :model-value="newlyCreatedUrl?.shortenUrl"
            readonly
            variant="solo-filled"
            class="mt-4"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyToClipboard"
          ></v-text-field>
           <p v-if="copySuccess" class="text-green-400 text-sm mt-2">Copied to clipboard!</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="isModalVisible = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toggle Switch -->
    <div class="absolute bottom-5 right-5 z-20 flex items-end space-x-2 text-white pointer-events-auto custom-toggle">
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

.custom-form {
  max-width: 35rem;
  width: 100%;
}

.custom-toggle {
  padding: 2rem;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
}
</style>
