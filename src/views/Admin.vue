<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const isLoggedIn = ref(false);
const username = ref('');
const password = ref('');
const errorMessage = ref('');

// Log table state
const clickLogs = ref([]);
const logHeaders = ref([
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Short Key', key: 'shortKey' },
  { title: 'Clicked At', key: 'clickedAt' },
  { title: 'User Agent', key: 'userAgent' },
  { title: 'Country', key: 'country' },
]);
const totalLogs = ref(0);
const loadingLogs = ref(true);

// Chart state
const chartData = ref({
  labels: [],
  datasets: [{
    label: '클릭 수',
    backgroundColor: '#f87979',
    data: []
  }]
});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});


const login = async () => {
  try {
    const response = await apiClient.post('/api/admin/login', {
      username: username.value,
      password: password.value,
    });
    const token = response.data.data.token;
    localStorage.setItem('admin-token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    isLoggedIn.value = true;
    errorMessage.value = '';
    // 로그인 성공 후 데이터 로드
    await fetchStats();
    await fetchClickLogs({ page: 1, itemsPerPage: 10, sortBy: [] });
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.';
    isLoggedIn.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('admin-token');
  delete apiClient.defaults.headers.common['Authorization'];
  isLoggedIn.value = false;
  clickLogs.value = [];
  chartData.value = { labels: [], datasets: [{ data: [], label: '클릭 수', backgroundColor: '#f87979' }] };
};

const fetchClickLogs = async ({ page, itemsPerPage, sortBy }) => {
  loadingLogs.value = true;
  try {
    let url = `/api/admin/logs?page=${page - 1}&size=${itemsPerPage}`;
    if (sortBy && sortBy.length > 0) {
      url += `&sort=${sortBy[0].key},${sortBy[0].order}`;
    }

    const response = await apiClient.get(url);
    clickLogs.value = response.data.data.content;
    totalLogs.value = response.data.data.totalElements;
  } catch (error) {
    console.error('Error fetching click logs:', error);
    if (error.response && error.response.status === 401) {
      logout();
    }
  } finally {
    loadingLogs.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await apiClient.get('/api/admin/stats');
    const stats = response.data.data;
    if (stats) {
      chartData.value.labels = stats.map(s => s.date).reverse();
      chartData.value.datasets[0].data = stats.map(s => s.count).reverse();
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    if (error.response && error.response.status === 401) {
      logout();
    }
  }
};


onMounted(() => {
  const token = localStorage.getItem('admin-token');
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    isLoggedIn.value = true;
    // 앱 마운트 시 데이터 로드
    fetchStats();
    fetchClickLogs({ page: 1, itemsPerPage: 10, sortBy: [] });
  }
});
</script>

<template>
  <v-container class="admin-container fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <!-- 로그인 폼 -->
        <div v-if="!isLoggedIn" class="login-box pa-4">
          <div class="login-key">
            <v-icon>mdi-key-variant</v-icon>
          </div>
          <div class="login-title">
            ADMIN PANEL
          </div>

          <div class="login-form">
            <v-form @submit.prevent="login">
              <div class="form-group">
                <label class="form-control-label">USERNAME</label>
                <v-text-field
                  v-model="username"
                  variant="underlined"
                  required
                ></v-text-field>
              </div>
              <div class="form-group">
                <label class="form-control-label">PASSWORD</label>
                <v-text-field
                  v-model="password"
                  type="password"
                  variant="underlined"
                  required
                ></v-text-field>
              </div>

              <div class="loginbttm">
                <div class="login-text">
                   <v-alert v-if="errorMessage" type="error" density="compact" variant="text" class="pa-0">
                    {{ errorMessage }}
                  </v-alert>
                </div>
                <div class="login-button">
                  <v-btn type="submit" variant="outlined" class="login-btn">LOGIN</v-btn>
                </div>
              </div>
            </v-form>
          </div>
        </div>

        <!-- 관리자 대시보드 -->
        <div v-else>
          <v-card color="grey-darken-3">
            <v-toolbar color="primary">
              <v-toolbar-title>관리자 대시보드</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="logout">
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <h2 class="mb-4">일별 클릭 통계</h2>
              <v-sheet color="grey-darken-2" class="pa-4">
                 <Bar v-if="chartData.labels && chartData.labels.length" :data="chartData" :options="chartOptions" />
              </v-sheet>
              
              <h2 class="mt-8 mb-4">클릭 로그</h2>
              <v-data-table-server
                :headers="logHeaders"
                :items="clickLogs"
                :items-length="totalLogs"
                :loading="loadingLogs"
                @update:options="fetchClickLogs"
                class="elevation-1"
                theme="dark"
              ></v-data-table-server>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.admin-container {
  background: #222D32;
  font-family: 'Roboto', sans-serif;
}

.login-box {
    margin-top: 75px;
    background: #1A2226;
    text-align: center;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.login-key {
    height: 100px;
    line-height: 100px;
}

.login-key .v-icon {
    font-size: 80px;
    background: -webkit-linear-gradient(#27EF9F, #0DB8DE);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.login-title {
    margin-top: 15px;
    text-align: center;
    font-size: 30px;
    letter-spacing: 2px;
    font-weight: bold;
    color: #ECF0F5;
}

.login-form {
    margin-top: 25px;
    text-align: left;
}

.form-group {
    margin-bottom: 40px;
    outline: 0px;
}

.form-control-label {
    font-size: 10px;
    color: #6C6C6C;
    font-weight: bold;
    letter-spacing: 1px;
}

.login-btn {
    border-color: #0DB8DE;
    color: #0DB8DE;
    border-radius: 0px;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.login-btn:hover {
    background-color: #0DB8DE;
    color: white;
}

.loginbttm {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
}

.login-button {
    text-align: right;
}

.login-text {
    text-align: left;
    color: #A2A4A4;
}

/* Vuetify v-text-field customization */
:deep(.v-text-field) {
  color: #ECF0F5;
}

:deep(.v-text-field__details) {
  display: none;
}

:deep(.v-input--density-default .v-field__input) {
  padding-top: 10px;
  padding-bottom: 6px;
}

:deep(input) {
  font-weight: bold !important;
}

:deep(.v-field--variant-underlined .v-field__outline::before) {
  border-color: #0DB8DE;
}

:deep(.v-field--variant-underlined .v-field__outline::after) {
  border-color: #27EF9F;
}
</style> 