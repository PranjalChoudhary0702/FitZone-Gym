/* Booking API Service */
const bookingService = {
  async getBookings() {
    return await apiClient.get('/bookings');
  },
  async createBooking(rawBookingData) {
    // 1. Validate & Map fields dynamically from variants (name, email, phone, mobile, fullName, bookingType)
    const validTypes = ['Free Trial Pass', 'Class Reservation', 'Personal Training Consultation'];
    let type = rawBookingData.type || rawBookingData.bookingType || 'Free Trial Pass';

    if (!validTypes.includes(type)) {
      type = 'Free Trial Pass';
    }

    const guestName = (rawBookingData.guestName || rawBookingData.name || rawBookingData.fullName || '').toString().trim();
    const guestEmail = (rawBookingData.guestEmail || rawBookingData.email || '').toString().trim();
    const guestPhone = (rawBookingData.guestPhone || rawBookingData.phone || rawBookingData.mobile || '').toString().trim();

    // 2. Pre-flight client validation to prevent undefined/null/empty field submission
    if (!guestName || !guestEmail || !guestPhone) {
      const missing = [];
      if (!guestName) missing.push('guestName');
      if (!guestEmail) missing.push('guestEmail');
      if (!guestPhone) missing.push('guestPhone');
      throw new Error(`Missing required booking fields: ${missing.join(', ')}`);
    }

    // 3. Build normalized payload matching backend requirements
    const payload = {
      type,
      guestName,
      guestEmail,
      guestPhone,
      ...(rawBookingData.classScheduleId ? { classScheduleId: rawBookingData.classScheduleId } : {}),
      ...(rawBookingData.className ? { className: rawBookingData.className } : {}),
      ...(rawBookingData.startDate ? { startDate: rawBookingData.startDate } : {})
    };

    // Requirement #8: Add required console.log
    console.log("Booking Payload:", payload);

    try {
      const response = await apiClient.post('/bookings', payload);
      
      // Requirement #8: Add required console.log
      console.log("Server Response:", response);
      return response;
    } catch (error) {
      if (error.response) {
        // Requirement #9: Print complete response body on error
        console.error('[Server Error Response Body]:', error.response.data);
      }
      throw error;
    }
  },
  async updateStatus(id, status) {
    return await apiClient.patch(`/bookings/${id}/status`, { status });
  }
};
