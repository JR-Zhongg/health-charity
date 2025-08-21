<template>
  <div class="container">
    <h1>Health Resources Table</h1>
    <p>This table demonstrates sorting, filtering (searching) by column, and pagination.</p>

    <!-- ✅ 1. 为表格头部添加容器，并加入导出按钮 -->
    <div class="table-header">
      <button @click="exportData" class="export-btn">Export to CSV</button>
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <input v-model="filters['global'].value" placeholder="Keyword Search" />
      </span>
    </div>

    <!-- v-if/v-else 添加了空状态处理 -->
    <div v-if="tableData && tableData.length > 0">
      <DataTable
        :value="tableData"
        v-model:filters="filters"
        :globalFilterFields="['title', 'category', 'summary', 'tags']"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        removableSort
        stripedRows
        tableStyle="min-width: 50rem"
      >
        <Column field="title" header="Title" sortable></Column>
        <Column field="category" header="Category" sortable></Column>
        <Column field="summary" header="Summary"></Column>
        <Column field="tags" header="Tags">
          <template #body="{ data }">
            {{ Array.isArray(data.tags) ? data.tags.join(', ') : '' }}
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="empty-state">
      <p>No resources found or data is loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRaw } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useResources, type Resource } from '../composables/useResources';

// 从 useResources 获取全局的、响应式的资源数据
const { resources } = useResources();

// 创建一个响应式的、安全的副本
const tableData = computed(() =>
  toRaw(resources.value).map(resource => ({ ...resource }))
);

// 定义全局筛选的配置
const filters = ref({
    global: { value: null, matchMode: 'contains' },
});

// ✅ 2. 添加导出数据的函数
function exportData() {
  const dataToExport = tableData.value;
  if (!dataToExport || dataToExport.length === 0) {
    alert("No data to export.");
    return;
  }

  // 定义 CSV 的表头和对应的数据字段
  const headers = {
    id: 'ID',
    title: 'Title',
    category: 'Category',
    summary: 'Summary',
    tags: 'Tags',
    createdAt: 'Created At',
    url: 'URL'
  };

  const fields = Object.keys(headers) as (keyof typeof headers)[];

  // 创建 CSV 头部字符串
  let csvContent = (Object.values(headers) as string[]).join(',') + '\n';

  // 遍历数据，创建每一行 CSV
  dataToExport.forEach(item => {
    const row = fields.map(field => {
      // @ts-ignore
      let value = item[field];

      // 特殊处理数组（如 tags）
      if (Array.isArray(value)) {
        value = value.join('; '); // 用分号连接数组元素
      }

      // 处理数据中的逗号和引号，防止 CSV 格式错乱
      const stringValue = String(value ?? '').replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
    csvContent += row + '\n';
  });

  // 创建 Blob 并触发下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "health-resources.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between; /* ✅ 让元素分布在两端 */
  align-items: center;
  margin-bottom: 1rem;
}

/* ✅ 导出按钮的样式 */
.export-btn {
  padding: 0.5rem 1rem;
  background-color: #1d9a59;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.export-btn:hover {
  background-color: #177a47;
}

.p-input-icon-left > input {
  padding-left: 2.5rem;
  width: 250px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  margin-top: 1rem;
  border: 1px dashed #ccc;
  border-radius: 6px;
  color: #666;
}
</style>
