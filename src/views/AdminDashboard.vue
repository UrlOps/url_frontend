<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import Galaxy from '../components/Galaxy.vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const drawer = ref(true);
const selectedMenu = ref('urlMappings'); // 기본 선택 메뉴

// UrlMapping 상태
const urlMappings = ref([]);
const urlMappingHeaders = ref([
  { title: 'ID', key: 'id', align: 'center' },
  { title: 'Short Key', key: 'shortKey', align: 'center' },
  { title: 'Original URL', key: 'originalUrl', align: 'center' },
  { title: 'Created At', key: 'createdAt', align: 'center' },
]);
const totalUrlMappings = ref(0);
const loadingUrlMappings = ref(true);
const searchShortKey = ref('');
const searchOriginalUrl = ref('');
const searchUrlStartDate = ref(null);
const searchUrlEndDate = ref(null);


// ClickLog 상태
const clickLogs = ref([]);
const clickLogHeaders = ref([
  { title: 'ID', key: 'id', align: 'center' },
  { title: 'Short Key', key: 'shortKey', align: 'center' },
  { title: 'User Agent', key: 'userAgent', align: 'center' },
  { title: 'IP Address', key: 'ipAddress', align: 'center' },
  { title: 'Clicked At', key: 'createdAt', align: 'center' },
]);
const totalClickLogs = ref(0);
const loadingClickLogs = ref(true);
const searchIp = ref('');
const searchStartDate = ref(null);
const searchEndDate = ref(null);

// DailyStats 상태
const searchStatsStartDate = ref(null);
const searchStatsEndDate = ref(null);
const dailyStatsChartData = ref({
  labels: [],
  datasets: [{
    label: '일별 총 클릭 수',
    backgroundColor: '#42A5F5',
    data: []
  }]
});
const dailyStatsChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  }
});

const itemsPerPageOptions = ref([
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
]);

const fetchUrlMappings = async ({ page, itemsPerPage, sortBy }) => {
  loadingUrlMappings.value = true;
  try {
    let url = `/api/admin/url-mappings?page=${page - 1}&size=${itemsPerPage}`;
    if (sortBy && sortBy.length > 0) {
      url += `&sort=${sortBy[0].key},${sortBy[0].order}`;
    }
    if (searchShortKey.value) url += `&shortKey=${searchShortKey.value}`;
    if (searchOriginalUrl.value) url += `&originalUrl=${searchOriginalUrl.value}`;
    if (searchUrlStartDate.value) url += `&startDate=${searchUrlStartDate.value}`;
    if (searchUrlEndDate.value) url += `&endDate=${searchUrlEndDate.value}`;

    const response = await apiClient.get(url);
    urlMappings.value = response.data.content;
    totalUrlMappings.value = response.data.totalElements;
  } catch (error) {
    console.error('Error fetching URL mappings:', error);
  } finally {
    loadingUrlMappings.value = false;
  }
};

const searchUrlMappings = () => {
    fetchUrlMappings({ page: 1, itemsPerPage: 10, sortBy: [] });
};

const fetchClickLogs = async ({ page, itemsPerPage, sortBy }) => {
  loadingClickLogs.value = true;
  try {
    let url = `/api/admin/click-logs?page=${page - 1}&size=${itemsPerPage}`;
    if (sortBy && sortBy.length > 0) {
      url += `&sort=${sortBy[0].key},${sortBy[0].order}`;
    }
    if (searchIp.value) {
        url += `&ipAddress=${searchIp.value}`;
    }
    if (searchStartDate.value) {
        url += `&startDate=${searchStartDate.value}`;
    }
    if (searchEndDate.value) {
        url += `&endDate=${searchEndDate.value}`;
    }
    const response = await apiClient.get(url);
    clickLogs.value = response.data.content;
    totalClickLogs.value = response.data.totalElements;
  } catch (error) {
    console.error('Error fetching click logs:', error);
  } finally {
    loadingClickLogs.value = false;
  }
};

const searchClickLogs = () => {
    fetchClickLogs({ page: 1, itemsPerPage: 10, sortBy: [] });
};


const fetchDailyStats = async () => {
  try {
    let url = `/api/admin/daily-stats?page=0&size=365&sort=date,asc`;
    if (searchStatsStartDate.value) url += `&startDate=${searchStatsStartDate.value}`;
    if (searchStatsEndDate.value) url += `&endDate=${searchStatsEndDate.value}`;

    const response = await apiClient.get(url);
    const stats = response.data.content;
    if (stats) {
      dailyStatsChartData.value = {
        labels: stats.map(s => s.date),
        datasets: [{
          ...dailyStatsChartData.value.datasets[0],
          data: stats.map(s => s.clickCount)
        }]
      };
    } else {
      dailyStatsChartData.value = {
        labels: [],
        datasets: [{
          ...dailyStatsChartData.value.datasets[0],
          data: []
        }]
      };
    }
  } catch (error) {
    console.error('Error fetching daily stats:', error);
  }
};

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/admin';
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchDailyStats();
  } else {
    window.location.href = '/admin';
  }
});
</script>

<template>
  <v-app id="inspire" theme="dark">
     <Galaxy />
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item title="Admin Dashboard" subtitle="URL Shortener"/>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item
            prepend-icon="mdi-link"
            title="URL Mappings"
            @click="selectedMenu = 'urlMappings'"
        />
        <v-list-item
            prepend-icon="mdi-cursor-default-click"
            title="Click Logs"
            @click="selectedMenu = 'clickLogs'"
        />
        <v-list-item
            prepend-icon="mdi-chart-bar"
            title="Daily Stats"
            @click="selectedMenu = 'dailyStats'"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"/>
      <v-toolbar-title>Back Office</v-toolbar-title>
      <v-spacer/>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-card v-if="selectedMenu === 'urlMappings'" class="pa-4 dashboard-card">
          <v-card-title>URL Mappings</v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-text-field
                    v-model="searchShortKey"
                    label="Search by Short Key"
                    dense
                    outlined
                    clearable
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                    v-model="searchOriginalUrl"
                    label="Search by Original URL"
                    dense
                    outlined
                    clearable
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field
                    v-model="searchUrlStartDate"
                    label="Start Date"
                    type="date"
                    dense
                    outlined
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field
                    v-model="searchUrlEndDate"
                    label="End Date"
                    type="date"
                    dense
                    outlined
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="2">
                <v-btn @click="searchUrlMappings" color="primary">Search</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-data-table-server
            :headers="urlMappingHeaders"
            :items="urlMappings"
            :items-length="totalUrlMappings"
            :loading="loadingUrlMappings"
            @update:options="fetchUrlMappings"
            :items-per-page-options="itemsPerPageOptions"
            class="elevation-1"
          />
        </v-card>

        <v-card v-if="selectedMenu === 'clickLogs'" class="pa-4 dashboard-card">
          <v-card-title>Click Logs</v-card-title>
          
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="searchIp"
                  label="Search by IP Address"
                  dense
                  outlined
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                    v-model="searchStartDate"
                    label="Start Date"
                    type="date"
                    dense
                    outlined
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                    v-model="searchEndDate"
                    label="End Date"
                    type="date"
                    dense
                    outlined
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="2">
                <v-btn @click="searchClickLogs" color="primary">Search</v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-data-table-server
            :headers="clickLogHeaders"
            :items="clickLogs"
            :items-length="totalClickLogs"
            :loading="loadingClickLogs"
            @update:options="fetchClickLogs"
            :items-per-page-options="itemsPerPageOptions"
            class="elevation-1"
          />
        </v-card>

        <v-card v-if="selectedMenu === 'dailyStats'" class="pa-4 dashboard-card">
          <v-card-title>Daily Stats</v-card-title>
           <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="4">
                <v-text-field
                    v-model="searchStatsStartDate"
                    label="Start Date"
                    type="date"
                    dense
                    outlined
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                    v-model="searchStatsEndDate"
                    label="End Date"
                    type="date"
                    dense
                    outlined
                    hide-details
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn @click="fetchDailyStats" color="primary">Search</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-sheet class="pa-4" style="background-color: rgba(255, 255, 255, 0.1);">
            <Bar
              v-if="dailyStatsChartData.labels && dailyStatsChartData.labels.length"
              :data="dailyStatsChartData"
              :options="dailyStatsChartOptions"
              style="height: 400px"
            />
          </v-sheet>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
#inspire {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dashboard-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

#admin-nav-list :deep(.v-list-item__content) {
  justify-content: center;
}
</style> 