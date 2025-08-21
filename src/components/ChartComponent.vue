<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import type { PropType } from 'vue'

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend)

// Define the props for the component
defineProps({
  // ✅ FIX: Use the ChartData type from chart.js for better type safety
  chartData: {
    type: Object as PropType<ChartData<'doughnut'>>,
    required: true
  }
})

// Define the configuration options for the chart
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>
