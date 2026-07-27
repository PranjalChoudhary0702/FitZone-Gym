/* Trainer API Service */
const trainerService = {
  async getTrainers(category = '') {
    const url = category ? `/trainers?category=${category}` : '/trainers';
    return await apiClient.get(url);
  },
  async getTrainerById(id) {
    return await apiClient.get(`/trainers/${id}`);
  },
  async createTrainer(trainerData) {
    return await apiClient.post('/trainers', trainerData);
  },
  async updateTrainer(id, trainerData) {
    return await apiClient.put(`/trainers/${id}`, trainerData);
  },
  async deleteTrainer(id) {
    return await apiClient.delete(`/trainers/${id}`);
  }
};
