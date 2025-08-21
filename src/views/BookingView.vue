<template>
  <main class="container">
    <h1>Book an Appointment</h1>
    <p>Select an available time slot on the calendar to book a consultation.</p>

    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- 预约模态框 -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Book Slot</h2>
        <!-- ✅ 修复：安全地访问可选的 selectedSlotInfo -->
        <p v-if="selectedSlotInfo"><strong>Time:</strong> {{ selectedSlotInfo.startStr }} - {{ selectedSlotInfo.endStr }}</p>

        <form @submit.prevent="handleBooking">
          <div class="form-control">
            <label for="booking-name">Your Name:</label>
            <input id="booking-name" v-model="bookingName" type="text" required />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal">Cancel</button>
            <button type="submit" :disabled="isLoading">
              {{ isLoading ? 'Booking...' : 'Confirm Booking' }}
            </button>
          </div>
        </form>
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg } from '@fullcalendar/core'; // ✅ 1. 从 fullcalendar 导入正确的类型
import { useAppointments } from '../composables/useAppointments';
import { useAuth } from '../composables/useAuth';

const { appointments, createAppointment } = useAppointments();
const { currentUser, isAuthenticated } = useAuth();

const isModalOpen = ref(false);
// ✅ 2. 为 selectedSlotInfo 使用更具体的类型，而不是 any
const selectedSlotInfo = ref<DateSelectArg | null>(null);
const bookingName = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

// 将我们的预约数据转换为 FullCalendar 需要的事件格式
const calendarEvents = computed(() => {
  return appointments.value.map(apt => ({
    title: `Booked - ${apt.title}`,
    start: apt.start,
    end: apt.end,
    backgroundColor: '#d3d3d3',
    borderColor: '#d3d3d3',
    textColor: '#37352f',
  }));
});

// FullCalendar 的配置对象
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  selectable: true,
  // ✅ 3. 为 select 事件的 info 参数使用正确的类型
  select: (info: DateSelectArg) => {
    if (!isAuthenticated.value) {
      alert('You must be logged in to book an appointment.');
      return;
    }
    // 检查所选时间是否在过去
    if (new Date(info.start) < new Date()) {
      alert("You cannot book appointments in the past.");
      return;
    }
    selectedSlotInfo.value = info;
    openModal();
  },
  events: calendarEvents, // 绑定事件
  slotMinTime: '09:00:00', // 可预约的最早时间
  slotMaxTime: '17:00:00', // 可预约的最晚时间
  allDaySlot: false,
});

function openModal() {
  bookingName.value = currentUser.value?.displayName || '';
  error.value = null;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleBooking() {
  if (!bookingName.value.trim() || !currentUser.value || !selectedSlotInfo.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    await createAppointment({
      title: bookingName.value,
      start: selectedSlotInfo.value.startStr,
      end: selectedSlotInfo.value.endStr,
      userId: currentUser.value.uid,
    });
    closeModal();
  } catch (err) { // ✅ 4. 对捕获的错误使用 unknown 类型以增强类型安全
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'An unexpected error occurred.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.calendar-container {
  margin-top: 2rem;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}
.form-control {
  margin: 1rem 0;
}
.form-control label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-control input {
  width: 100%;
  padding: 0.5rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.error-text {
  color: #d93025;
  margin-top: 1rem;
}
</style>
