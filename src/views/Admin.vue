<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';
import Galaxy from '../components/Galaxy.vue';

const router = useRouter();
const isLoggedIn = ref(false);
const username = ref('');
const password = ref('');
const errorMessage = ref('');

const login = async () => {
  try {
    const response = await apiClient.post('/api/admin/login', {
      username: username.value,
      password: password.value,
    });
    const token = response.data.data.token;
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    errorMessage.value = '';
    router.push('/admin/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.';
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    router.push('/admin/dashboard');
  }
});
</script>

<template>
  <div class="admin-container">
    <Galaxy class="absolute top-0 left-0 w-full h-full z-0"/>
    <v-container class="fill-height relative z-10" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <!-- 로그인 폼 -->
          <div v-if="!isLoggedIn">
            <v-card class="login-card" elevation="12">
              <v-card-title class="text-center text-h5 font-weight-bold py-4">
                Admin Login
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="login">
                  <v-text-field
                    v-model="username"
                    label="Username"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    required
                    class="mb-4"
                  />
                  <v-text-field
                    v-model="password"
                    label="Password"
                    type="password"
                    prepend-inner-icon="mdi-lock"
                    variant="outlined"
                    required
                  />
                  <v-alert v-if="errorMessage" type="error" density="compact" class="mt-4">
                    {{ errorMessage }}
                  </v-alert>
                  <v-btn type="submit" color="primary" block size="large" class="mt-6">
                    Login
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.admin-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
}

:deep(.v-card-title) {
  color: #eee;
}

:deep(.v-label) {
  color: #bbb !important;
}

:deep(input) {
  color: white !important;
}

:deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.v-btn) {
  background-image: linear-gradient(to right, #27EF9F, #0DB8DE);
  color: white;
  font-weight: bold;
}
</style> 