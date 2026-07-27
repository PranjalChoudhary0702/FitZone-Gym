/* Membership Plan API Service */
const planService = {
  async getPlans() {
    return await apiClient.get('/plans');
  },
  async getPlanById(id) {
    return await apiClient.get(`/plans/${id}`);
  },
  async createPlan(planData) {
    return await apiClient.post('/plans', planData);
  },
  async updatePlan(id, planData) {
    return await apiClient.put(`/plans/${id}`, planData);
  }
};
