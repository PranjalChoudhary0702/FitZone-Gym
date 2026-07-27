/* Auth & Test Email API Service */
const authService = {
  async verifyPin(pin) {
    return await apiClient.post('/auth/verify-pin', { pin });
  },
  async sendTestEmail(to) {
    return await apiClient.post('/auth/test-email', { to });
  }
};
