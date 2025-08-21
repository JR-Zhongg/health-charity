<template>
  <div class="container-wide">
    <h1>Admin Dashboard</h1>
    <p>An overview of the application status.</p>

    <!-- Chart Container -->
    <section class="box chart-container">
      <h2>Resources by Category</h2>
      <div v-if="chartData.labels.length > 0" class="chart-wrapper">
        <ChartComponent :chartData="chartData" />
      </div>
      <p v-else>Loading chart data or no resources found...</p>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useResources } from '../composables/useResources';
// ✅ FIX: Switched back to a relative path that works in your setup
import ChartComponent from '../components/ChartComponent.vue';

// 1. Get data from useResources
const { resources } = useResources();

// 2. Create a computed property to process the data for the chart
const chartData = computed(() => {
  const categoryCounts: Record<string, number> = {};

  // Count the number of resources in each category
  for (const resource of resources.value) {
    if (categoryCounts[resource.category]) {
      categoryCounts[resource.category]++;
    } else {
      categoryCounts[resource.category] = 1;
    }
  }

  const labels = Object.keys(categoryCounts);
  const data = Object.values(categoryCounts);

  return {
    labels: labels,
    datasets: [
      {
        backgroundColor: [
          '#41B883', '#E46651', '#00D8FF', '#DD1B16',
          '#FFC107', '#607D8B', '#9C27B0'
        ],
        data: data
      }
    ]
  };
});
</script>

<style scoped>
.container-wide {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
}
.box {
  margin-top: 1.5rem;
  border: 1px solid #e4e4e4;
  padding: 1.5rem;
  border-radius: 8px;
  background: #fff;
}
.chart-container {
  padding-bottom: 2rem;
}
.chart-wrapper {
  position: relative;
  height: 350px; /* Give the chart a fixed height */
}
</style>
