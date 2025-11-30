<template>
  <div class="dashboard">
    <div class="scroll-wrapper">
      <!-- KPI CARDS -->
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

      <!-- CHARTS -->
      <div class="chart-row">
        <div class="chart-card">
          <h3>En Çok Satan Ürünler</h3>
          <canvas ref="topItemsCanvas"></canvas>
        </div>

        <div class="chart-card">
          <h3>Haftalık Gelir</h3>
          <canvas ref="weeklyCanvas"></canvas>
        </div>

        <div class="chart-card">
          <h3>Sipariş Durumları</h3>
          <canvas ref="statusCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import api from "@/config/api";
import Chart from "chart.js/auto";
import { useGlobal } from "@/composables";

const { formatPrice, getBranchId } = useGlobal();

/* =========================
   📊 STATE
   ========================= */
const todayRevenue = ref(0);
const monthRevenue = ref(0);
const totalRevenue = ref(0);
const totalOrders = ref(0);
const topItems = ref([]);
const weeklyRevenue = ref([]);
const statusSummary = ref({
  waiting: 0,
  preparing: 0, // currently always 0 (no column), reserved for future
  served: 0,
  cancelled: 0,
});

/* Canvas refs */
const topItemsCanvas = ref(null);
const weeklyCanvas = ref(null);
const statusCanvas = ref(null);

/* Chart instances */
let topItemsChart = null;
let weeklyChart = null;
let statusChart = null;

/* =========================
   📥 FETCH STATS
   ========================= */
const fetchStats = async () => {
  try {
    const params = {};
    const branchId = getBranchId?.();

    // Admin dashboard can filter by branch; non-admin will be scoped in backend
    if (branchId) {
      params.branchId = branchId;
    }

    const res = await api.get("/stats", { params });
    const data = res.data || {};

    // KPIs
    todayRevenue.value = Number(data.todayRevenue || 0);
    monthRevenue.value = Number(data.monthRevenue || 0);
    totalRevenue.value = Number(data.totalRevenue || 0);
    totalOrders.value = Number(data.totalOrders || 0);

    // Charts data
    topItems.value = Array.isArray(data.globalTop) ? data.globalTop : [];
    weeklyRevenue.value = Array.isArray(data.weeklyRevenue)
      ? data.weeklyRevenue
      : [];

    // Status summary (falls back gracefully if backend doesn't send it)
    statusSummary.value = {
      waiting: Number(data.statusSummary?.waiting || 0),
      preparing: Number(data.statusSummary?.preparing || 0), // will be 0 for now
      served: Number(data.statusSummary?.served || 0),
      cancelled: Number(data.statusSummary?.cancelled || 0),
    };

    // Ensure DOM + canvases are ready before drawing
    await nextTick();
    drawCharts();
  } catch (err) {
    console.error("Stats error:", err);
  }
};

/* =========================
   🎨 DRAW CHARTS
   ========================= */
const drawCharts = () => {
  // Cleanup old charts
  if (topItemsChart) {
    topItemsChart.destroy();
    topItemsChart = null;
  }
  if (weeklyChart) {
    weeklyChart.destroy();
    weeklyChart = null;
  }
  if (statusChart) {
    statusChart.destroy();
    statusChart = null;
  }

  /* 🥇 Top Items Bar Chart */
  if (topItemsCanvas.value && topItems.value.length) {
    const labels = topItems.value.map((i) => i.name);
    const data = topItems.value.map((i) => i.totalQty);

    const backgroundColors = [];
    const borderColors = [];

    topItems.value.forEach((_, index) => {
      if (index === 0) {
        backgroundColors.push("#d4af37"); // Gold
        borderColors.push("#d4af37");
      } else if (index === 1) {
        backgroundColors.push("#c0c0c0"); // Silver
        borderColors.push("#c0c0c0");
      } else if (index === 2) {
        backgroundColors.push("#cd7f32"); // Bronze
        borderColors.push("#cd7f32");
      } else {
        backgroundColors.push("rgba(62, 44, 39, 0.25)");
        borderColors.push("rgba(62, 44, 39, 0.8)");
      }
    });

    topItemsChart = new Chart(topItemsCanvas.value, {
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
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} adet`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#3e2c27",
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#3e2c27",
              precision: 0,
            },
          },
        },
      },
    });
  }

  /* 📈 Weekly Revenue Line Chart */
  if (weeklyCanvas.value && weeklyRevenue.value.length) {
    weeklyChart = new Chart(weeklyCanvas.value, {
      type: "line",
      data: {
        labels: weeklyRevenue.value.map((d) => d.day),
        datasets: [
          {
            label: "Gelir (₺)",
            data: weeklyRevenue.value.map((d) => Number(d.total || 0)),
            borderColor: "#3e2c27",
            backgroundColor: "rgba(62, 44, 39, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatPrice(ctx.parsed.y),
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#3e2c27",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#3e2c27",
              callback: (v) => formatPrice(v),
            },
          },
        },
      },
    });
  }

  /* 🍩 Order Status Doughnut */
  if (statusCanvas.value) {
    const s = statusSummary.value;
    const labels = ["Bekleyen", "Hazırlanıyor", "Servis Edildi", "İptal"];
    const data = [s.waiting, s.preparing, s.served, s.cancelled];

    // Don't render if all zero
    if (!data.some((v) => v > 0)) return;

    statusChart = new Chart(statusCanvas.value, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "rgba(255, 193, 7, 0.9)", // waiting - amber
              "rgba(33, 150, 243, 0.9)", // preparing - blue
              "rgba(76, 175, 80, 0.9)", // served - green
              "rgba(244, 67, 54, 0.9)", // cancelled - red
            ],
            borderColor: ["#fbc02d", "#1e88e5", "#388e3c", "#d32f2f"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 14,
              color: "#3e2c27",
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || "";
                const value = ctx.parsed || 0;
                const total = data.reduce((a, b) => a + b, 0) || 1;
                const pct = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${pct}%)`;
              },
            },
          },
        },
        cutout: "60%",
      },
    });
  }
};

onMounted(fetchStats);

onBeforeUnmount(() => {
  if (topItemsChart) topItemsChart.destroy();
  if (weeklyChart) weeklyChart.destroy();
  if (statusChart) statusChart.destroy();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--cream-light);
  color: var(--espresso);
}

/* You already have a global .scroll-wrapper; this just adds padding */
.scroll-wrapper {
  padding-right: 0.25rem;
}

/* --- Stats Grid --- */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.2rem 1.4rem;
  border-radius: 14px;
  text-align: left;
  border: 1px solid rgba(164, 126, 59, 0.25);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold), transparent);
}

.stat-card h3 {
  font-size: 0.9rem;
  color: rgba(62, 44, 39, 0.7);
  margin-bottom: 0.35rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.stat-card p {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--espresso);
}

/* --- Charts --- */

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.chart-card {
  background: white;
  padding: 1.25rem 1.4rem;
  border-radius: 14px;
  border: 1px solid rgba(164, 126, 59, 0.25);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  min-height: 260px;
}

.chart-card h3 {
  margin-bottom: 0.75rem;
  font-size: 1.05rem;
  color: var(--espresso);
  font-weight: 600;
}

.chart-card canvas {
  flex: 1;
  width: 100% !important;
}

/* Limit height but allow responsiveness */
canvas {
  max-height: 320px;
}

/* Mobile tweaks */
@media (max-width: 900px) {
  .stat-card {
    padding: 1rem 1.1rem;
  }

  .stat-card p {
    font-size: 1.4rem;
  }

  .chart-card {
    padding: 1rem 1.1rem;
    min-height: 240px;
  }
}
</style>
