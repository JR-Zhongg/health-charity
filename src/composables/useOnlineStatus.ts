import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 一个用于跟踪浏览器在线状态的 Composable。
 * @returns 一个包含 isOnline 状态的响应式 ref。
 */
export function useOnlineStatus() {
  // navigator.onLine 提供初始状态
  const isOnline = ref(navigator.onLine);

  // 更新状态的函数
  const updateStatus = () => {
    isOnline.value = navigator.onLine;
  };

  // 在组件挂载时，添加 'online' 和 'offline' 事件监听器
  onMounted(() => {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
  });

  // 在组件卸载时，移除监听器以防止内存泄漏
  onUnmounted(() => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  });

  return {
    isOnline,
  };
}
