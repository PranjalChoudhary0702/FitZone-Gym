/* Class Schedule API Service */
const scheduleService = {
  async getSchedules(day = '') {
    const url = day ? `/schedules?day=${day}` : '/schedules';
    return await apiClient.get(url);
  },
  async createSchedule(scheduleData) {
    return await apiClient.post('/schedules', scheduleData);
  },
  async updateSchedule(id, scheduleData) {
    return await apiClient.put(`/schedules/${id}`, scheduleData);
  },
  async deleteSchedule(id) {
    return await apiClient.delete(`/schedules/${id}`);
  }
};
