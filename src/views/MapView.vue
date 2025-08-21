<template>
  <main class="map-container">
    <h1>Our Locations</h1>
    <!-- ✅ A11Y: 为地图容器添加 role 和 aria-label，向屏幕阅读器用户解释其功能 -->
    <div
      id="map"
      role="application"
      aria-label="Interactive map showing charity locations and your current position"
    ></div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 声明全局的 Leaflet 对象 `L`
declare const L: any;

let map: any = null; // 用于持有地图实例

// 预设的机构地点 (墨尔本)
const charityLocations = [
  {
    name: "St Vincent's Hospital Melbourne",
    lat: -37.803,
    lng: 144.972,
    info: "Major public hospital providing a range of health services."
  },
  {
    name: "The Royal Melbourne Hospital",
    lat: -37.799,
    lng: 144.956,
    info: "One of Australia's leading public hospitals."
  },
  {
    name: "Alfred Health",
    lat: -37.848,
    lng: 144.981,
    info: "A leading tertiary health service."
  }
];

onMounted(() => {
  // 确保 Leaflet 库已加载
  if (typeof L === 'undefined') {
    console.error("Leaflet is not loaded!");
    return;
  }

  // 1. 初始化地图
  map = L.map('map').setView([-37.8136, 144.9631], 13);

  // 2. 添加地图图层 (瓦片)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // 3. 实现功能一：用户定位
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // 在用户位置添加一个标记
      const userMarker = L.marker([userLat, userLng]).addTo(map);
      userMarker.bindPopup("<b>You are here!</b>").openPopup();

      // 将地图视图移动到用户位置
      map.setView([userLat, userLng], 15);
    }, () => {
      console.warn("Could not get user location.");
    });
  }

  // 4. 实现功能二：机构标注
  charityLocations.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lng]).addTo(map);
    marker.bindPopup(`<b>${loc.name}</b><br>${loc.info}`);
  });
});

// 在组件卸载时销毁地图实例，防止内存泄漏
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 必须为地图容器设置一个明确的高度 */
#map {
  height: 600px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>
