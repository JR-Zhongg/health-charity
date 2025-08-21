import { ref } from 'vue'

export interface Activity {
  id: number;
  service: string;
  location: string;
  category: string;
  visits: number;
}

// Mock data for the activity table
const defaultActivityData = ref<Activity[]>([
  { id: 1, service: 'Blood Pressure Check', location: 'Clinic A', category: 'Health Check', visits: 32 },
  { id: 2, service: 'Nutrition Workshop', location: 'Community Center', category: 'Wellness', visits: 24 },
  { id: 3, service: 'Home Exercise Guide', location: 'Online', category: 'Exercise', visits: 48 },
  { id: 4, service: 'Mental Health Talk', location: 'Library Hall', category: 'Mental Health', visits: 18 },
  { id: 5, service: 'Vaccination Drive', location: 'Mobile Van', category: 'Immunization', visits: 60 },
  { id: 6, service: 'Senior Yoga Class', location: 'Community Center', category: 'Exercise', visits: 15 },
  { id: 7, service: 'Diabetes Screening', location: 'Clinic B', category: 'Health Check', visits: 28 },
  { id: 8, service: 'Digital Literacy Course', location: 'Online', category: 'Education', visits: 35 },
  { id: 9, service: 'Grief Counseling', location: 'Clinic A', category: 'Mental Health', visits: 12 },
  { id: 10, service: 'Fall Prevention Seminar', location: 'Library Hall', category: 'Safety', visits: 22 },
  { id: 11, service: 'Flu Shots', location: 'Mobile Van', category: 'Immunization', visits: 75 },
]);

/**
 * Composable for managing service activity data.
 */
export function useActivity() {
  // In a real app, this might fetch from a database or use localStorage.
  // For this requirement, a reactive ref is sufficient.
  const activityData = ref(defaultActivityData.value);

  return {
    activityData,
  };
}
