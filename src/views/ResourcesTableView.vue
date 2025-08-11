<template>
  <div class="container">
    <h1>Health Resources Table</h1>

    <DataTable
      :value="resources"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      filterDisplay="row"
      :globalFilterFields="['title', 'category', 'tags']"
      responsiveLayout="scroll"
    >
      <Column field="title" header="Title" sortable filter />
      <Column field="category" header="Category" sortable filter />
      <Column field="summary" header="Summary" />
      <Column field="tags" header="Tags" :body="tagBody" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface Resource {
  id: number
  title: string
  category: string
  summary: string
  tags: string[]
}

const resources = ref<Resource[]>([
  {
    id: 1,
    title: 'Healthy Eating for Seniors',
    category: 'Nutrition',
    summary: 'Balanced diets and nutrients for seniors.',
    tags: ['diet', 'elderly', 'food']
  },
  {
    id: 2,
    title: 'Safe Home Exercises',
    category: 'Exercise',
    summary: 'Low-impact exercise programs at home.',
    tags: ['exercise', 'mobility']
  },
  {
    id: 3,
    title: 'Managing Loneliness',
    category: 'Mental Health',
    summary: 'Tips to reduce isolation in seniors.',
    tags: ['mental health', 'community']
  }
])

function tagBody(row: Resource): string {
  return row.tags.join(', ')
}
</script>

<style scoped>
.container {
  max-width: 1024px;
  margin: 2rem auto;
}
</style>
