/* Modern Toast Notification Helper System */
const Toast = {
  show(message, type = 'success', duration = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    const closeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
  },

  success(msg, duration) {
    this.show(msg, 'success', duration);
  },

  error(msg, duration) {
    this.show(msg, 'error', duration);
  },

  info(msg, duration) {
    this.show(msg, 'info', duration);
  }
};
