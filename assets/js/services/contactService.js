/* Contact Message API Service */
const contactService = {
  async getMessages() {
    return await apiClient.get('/contacts');
  },
  async submitMessage(contactData) {
    return await apiClient.post('/contacts', contactData);
  },
  async updateStatus(id, status) {
    return await apiClient.patch(`/contacts/${id}/status`, { status });
  }
};
