<template>
  <div class="dashboard">
    <div class="scroll-wrapper">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Bugünkü Satış</h3>
          <p>{{ formatPrice(todayRevenue) }}</p>
        </div>
        <div class="stat-card">
          <h3>Bu Ay</h3>
          <p>{{ formatPrice(monthRevenue) }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam</h3>
          <p>{{ formatPrice(totalRevenue) }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Sipariş</h3>
          <p>{{ totalOrders }}</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="chart-row">
        <div class="chart-card half">
          <h3>En Çok Satan Ürünler</h3>
          <canvas id="topItemsChart"></canvas>
        </div>

        <div class="chart-card half">
          <h3>Haftalık Gelir</h3>
          <canvas id="weeklyChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/config/api";
import Chart from "chart.js/auto";
import { useGlobal } from "@/composables";

const { formatPrice } = useGlobal();

const todayRevenue = ref(0);
const monthRevenue = ref(0);
const totalRevenue = ref(0);
const totalOrders = ref(0);
const topItems = ref([]);
const weeklyRevenue = ref([]);

const fetchStats = async () => {
  try {
    const res = await api.get(`/stats`);

    todayRevenue.value = Number(res.data.todayRevenue || 0);
    monthRevenue.value = Number(res.data.monthRevenue || 0);
    totalRevenue.value = Number(res.data.totalRevenue || 0);
    totalOrders.value = res.data.totalOrders || 0;
    topItems.value = res.data.globalTop || [];
    weeklyRevenue.value = res.data.weeklyRevenue || [];

    drawCharts();
  } catch (err) {
    console.error("Stats error:", err);
  }
};

const drawCharts = () => {
  // 🥇🥈🥉 Top Items Bar Chart with medal colors
  const topCtx = document.getElementById("topItemsChart")?.getContext("2d");
  if (topCtx && topItems.value.length) {
    const labels = topItems.value.map((i) => i.name);
    const data = topItems.value.map((i) => i.totalQty);

    const backgroundColors = [];
    const borderColors = [];

    topItems.value.forEach((_, index) => {
      if (index === 0) {
        // Gold
        backgroundColors.push("#d4af37");
        borderColors.push("#d4af37");
      } else if (index === 1) {
        // Silver
        backgroundColors.push("#c0c0c0");
        borderColors.push("#c0c0c0");
      } else if (index === 2) {
        // Bronze
        backgroundColors.push("#cd7f32");
        borderColors.push("#cd7f32");
      } else {
        // Neutral espresso tone for others
        backgroundColors.push("rgba(62, 44, 39, 0.25)");
        borderColors.push("rgba(62, 44, 39, 0.8)");
      }
    });

    new Chart(topCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Satılan Adet",
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    });
  }

  // Weekly Line Chart (keep espresso theme)
  const weekCtx = document.getElementById("weeklyChart")?.getContext("2d");
  if (weekCtx && weeklyRevenue.value.length) {
    new Chart(weekCtx, {
      type: "line",
      data: {
        labels: weeklyRevenue.value.map((d) => d.day),
        datasets: [
          {
            label: "Gelir (₺)",
            data: weeklyRevenue.value.map((d) => Number(d.total || 0)),
            borderColor: "#3e2c27", // espresso
            backgroundColor: "rgba(62, 44, 39, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    });
  }
};

onMounted(fetchStats);
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--cream-light);
  color: var(--espresso);
}

/* --- Stats Grid --- */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid var(--gold2);
  box-shadow: 0 4px 10px rgba(62, 44, 39, 0.08);
}

.stat-card h3 {
  font-size: 0.95rem;
  color: var(--gold2);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stat-card p {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--espresso);
}

/* --- Charts --- */

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--gold2);
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.08);
}

.chart-card h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--espresso);
  font-weight: 600;
}

canvas {
  max-height: 300px;
}
</style>
