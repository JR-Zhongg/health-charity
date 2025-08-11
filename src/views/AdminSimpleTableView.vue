<template>
  <div class="container">
    <h1>Service Activity Table</h1>

    <DataTable
      :value="activityData"
      paginator
      :rows="5"
      :rowsPerPageOptions="[5, 10]"
      filterDisplay="row"
      :globalFilterFields="['service', 'location', 'category']"
      responsiveLayout="scroll"
    >
      <Column field="service" header="Service" sortable filter />
      <Column field="location" header="Location" sortable filter />
      <Column field="category" header="Category" sortable filter />
      <Column field="visits" header="Visits" sortable />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface Activity {
  service: string
  location: string
  category: string
  visits: number
}

const activityData = ref<Activity[]>([
  { service: 'Blood Pressure Check', location: 'Clinic A', category: 'Health Check', visits: 32 },
  { service: 'Nutrition Workshop', location: 'Community Center', category: 'Wellness', visits: 24 },
  { service: 'Home Exercise Guide', location: 'Online', category: 'Exercise', visits: 48 },
  { service: 'Mental Health Talk', location: 'Library Hall', category: 'Mental Health', visits: 18 },
  { service: 'Vaccination Drive', location: 'Mobile Van', category: 'Immunization', visits: 60 },
])
</script>

<style scoped>
.container {
  max-width: 1024px;
  margin: 2rem auto;
}
</style>
