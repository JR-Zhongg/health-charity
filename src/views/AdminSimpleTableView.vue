<template>
  <div class="container">
    <h1>Service Activity Table</h1>

    <!-- 1. Add the global filter input -->
    <div class="table-header">
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <input v-model="filters['global'].value" placeholder="Keyword Search" />
      </span>
    </div>

    <!-- 2. Configure DataTable with global filter, sorting, and pagination -->
    <DataTable
      :value="tableData"
      v-model:filters="filters"
      :globalFilterFields="['service', 'location', 'category']"
      paginator
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20]"
      removableSort
      stripedRows
      tableStyle="min-width: 50rem"
    >
      <Column field="service" header="Service" sortable></Column>
      <Column field="location" header="Location" sortable></Column>
      <Column field="category" header="Category" sortable></Column>
      <Column field="visits" header="Visits" sortable></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRaw } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useActivity } from '../composables/useActivity'; // 3. Import the new composable

// 4. Get the activity data from the composable
const { activityData } = useActivity();

// 5. Create a stable, reactive copy for the table to prevent issues
const tableData = computed(() =>
  toRaw(activityData.value).map(activity => ({ ...activity }))
);

// 6. Define the global filter configuration
const filters = ref({
    global: { value: null, matchMode: 'contains' },
});
</script>

<style scoped>
.container {
  max-width: 1024px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.p-input-icon-left > input {
  padding-left: 2.5rem;
  width: 250px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
