/* Booking API Service */
const bookingService = {
  async getBookings() {
    return await apiClient.get('/bookings');
  },
  async createBooking(bookingData) {
    return await apiClient.post('/bookings', bookingData);
  },
  async updateStatus(id, status) {
    return await apiClient.patch(`/bookings/${id}/status`, { status });
  }
};
