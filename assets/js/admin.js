/* FitZone Gym - Admin CMS Logic & Secure DOM Injection Controller */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
});

/* --------------------------------------------------------------------------
   1. PIN AUTHENTICATION & SECURE DOM INJECTION CONTROLLER
   -------------------------------------------------------------------------- */
function initAdminAuth() {
  const pinGate = document.getElementById('adminPinGate');
  const pinForm = document.getElementById('adminPinForm');
  const pinInput = document.getElementById('adminPinInput');

  window.handleAdminUnauthorized = (message) => {
    sessionStorage.removeItem('adminToken');
    lockDashboard();
    Toast.error(`Session Expired / Unauthorized: ${message}`);
  };

  const token = sessionStorage.getItem('adminToken');
  if (token) {
    unlockDashboard();
  } else {
    lockDashboard();
  }

  function unlockDashboard() {
    if (pinGate) pinGate.style.display = 'none';

    // Inject Admin Dashboard from HTML5 Template if not already present
    if (!document.getElementById('adminDashboard')) {
      const template = document.getElementById('adminDashboardTemplate');
      if (template) {
        const clone = template.content.cloneNode(true);
        document.body.appendChild(clone);

        // Bind events to newly mounted DOM nodes
        initAdminTabs();
        initModals();
        initTestEmailHandler();
        initLogoutHandler();
      }
    }

    // Load CMS Data
    loadAdminTrainers();
    loadAdminPlans();
    loadAdminSchedules();
    loadAdminInquiries();
  }

  function lockDashboard() {
    if (pinGate) pinGate.style.display = 'flex';

    // Purge Admin Dashboard entirely from the rendered DOM
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) {
      dashboard.remove();
    }

    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 100);
    }
  }

  function initLogoutHandler() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminToken');
        Toast.info('🔒 Admin Portal Locked & Purged.');
        lockDashboard();
      });
    }
  }

  if (pinForm) {
    pinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pin = pinInput.value.trim();
      const submitBtn = document.getElementById('pinSubmitBtn');

      if (!pin) {
        Toast.error('Please enter your 4-6 digit Admin PIN');
        return;
      }

      setButtonLoading(submitBtn, true, 'Authenticating...');

      try {
        const res = await authService.verifyPin(pin);
        if (res.success && res.token) {
          sessionStorage.setItem('adminToken', res.token);
          Toast.success('🔓 Access Granted! Owner Admin CMS Unlocked.');
          unlockDashboard();
        } else {
          Toast.error(res.message || 'Invalid Admin PIN');
        }
      } catch (err) {
        Toast.error(`Authentication Failed: ${err.message}`);
        pinInput.value = '';
        pinInput.focus();
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }
}

function setButtonLoading(button, isLoading, loadingText = 'Processing...') {
  if (!button) return;
  if (isLoading) {
    button.setAttribute('data-original-text', button.innerHTML);
    button.disabled = true;
    button.innerHTML = `<span class="spinner-sm"></span> ${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
  }
}

/* --------------------------------------------------------------------------
   2. BREVO TEST EMAIL BUTTON HANDLER
   -------------------------------------------------------------------------- */
function initTestEmailHandler() {
  const testBtn = document.getElementById('testEmailBtn');
  if (!testBtn) return;

  testBtn.addEventListener('click', async () => {
    const targetEmail = prompt('Enter target email address to send Brevo SMTP test email:', 'admin@example.com');
    if (!targetEmail || !targetEmail.includes('@')) {
      Toast.error('Please provide a valid email address.');
      return;
    }

    setButtonLoading(testBtn, true, 'Sending Test...');

    try {
      const res = await authService.sendTestEmail(targetEmail.trim());
      Toast.success(`⚡ ${res.message}`);
    } catch (err) {
      Toast.error(`Brevo Test Failed: ${err.message}`);
    } finally {
      setButtonLoading(testBtn, false);
    }
  });
}

/* --------------------------------------------------------------------------
   3. TAB NAVIGATION & MODALS
   -------------------------------------------------------------------------- */
function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-menu-btn');
  const sections = document.querySelectorAll('.admin-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add('active');
    });
  });
}

function initModals() {
  const closeBtns = document.querySelectorAll('.modal-close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  const openAddTrainerBtn = document.getElementById('openAddTrainerModal');
  if (openAddTrainerBtn) {
    openAddTrainerBtn.addEventListener('click', () => {
      document.getElementById('trainerAdminForm').reset();
      document.getElementById('trainerFormId').value = '';
      document.getElementById('trainerModalTitle').textContent = 'Add New Trainer';
      document.getElementById('trainerAdminModal').classList.add('active');
    });
  }

  const openAddSchedBtn = document.getElementById('openAddScheduleModal');
  if (openAddSchedBtn) {
    openAddSchedBtn.addEventListener('click', () => {
      document.getElementById('scheduleAdminForm').reset();
      document.getElementById('scheduleAdminModal').classList.add('active');
    });
  }
}

/* --------------------------------------------------------------------------
   4. TRAINERS CMS CRUD
   -------------------------------------------------------------------------- */
async function loadAdminTrainers() {
  const tbody = document.getElementById('trainersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading trainers...</td></tr>';

  try {
    const res = await trainerService.getTrainers();
    const trainers = res.data || [];

    if (trainers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No trainers found. Click "Add New Trainer" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = trainers.map(t => `
      <tr>
        <td><strong>${t.name}</strong></td>
        <td>${t.role}</td>
        <td><span class="badge-status confirmed">${t.specialtyCategory}</span></td>
        <td>${t.experienceYears} Years</td>
        <td>
          <button class="btn btn-outline-lime btn-sm edit-trainer-btn" data-id="${t._id}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-secondary btn-sm delete-trainer-btn" data-id="${t._id}" style="color: var(--accent-crimson);"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.delete-trainer-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this trainer?')) {
          try {
            await trainerService.deleteTrainer(id);
            Toast.success('Trainer deleted successfully.');
            loadAdminTrainers();
          } catch (err) {
            Toast.error(`Delete failed: ${err.message}`);
          }
        }
      });
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--accent-crimson);">Error: ${error.message}</td></tr>`;
  }
}

// Global delegated trainer form listener
document.addEventListener('submit', async (e) => {
  if (e.target && e.target.id === 'trainerAdminForm') {
    e.preventDefault();
    const id = document.getElementById('trainerFormId').value;

    const payload = {
      name: document.getElementById('trainerFormName').value.trim(),
      role: document.getElementById('trainerFormRole').value.trim(),
      specialtyCategory: document.getElementById('trainerFormCategory').value,
      certifications: document.getElementById('trainerFormCerts').value.split(',').map(c => c.trim()).filter(Boolean),
      experienceYears: parseInt(document.getElementById('trainerFormExp').value, 10) || 1,
      imageUrl: document.getElementById('trainerFormImage').value.trim()
    };

    try {
      if (id) {
        await trainerService.updateTrainer(id, payload);
        Toast.success('Trainer profile updated!');
      } else {
        await trainerService.createTrainer(payload);
        Toast.success('New trainer created successfully!');
      }
      document.getElementById('trainerAdminModal').classList.remove('active');
      loadAdminTrainers();
    } catch (err) {
      Toast.error(`Operation failed: ${err.message}`);
    }
  }
});

/* --------------------------------------------------------------------------
   5. PLANS CMS
   -------------------------------------------------------------------------- */
async function loadAdminPlans() {
  const tbody = document.getElementById('plansTableBody');
  if (!tbody) return;

  try {
    const res = await planService.getPlans();
    const plans = res.data || [];

    tbody.innerHTML = plans.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>$${p.monthlyPrice} / mo</td>
        <td>$${p.annualMonthlyPrice} / mo</td>
        <td>${p.isPopular ? '<span class="badge-status confirmed">MOST POPULAR</span>' : 'Standard'}</td>
        <td>
          <button class="btn btn-outline-lime btn-sm" onclick="Toast.info('Plan details active in MongoDB')"><i class="fa-solid fa-check"></i> Active</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--accent-crimson);">Error loading plans: ${error.message}</td></tr>`;
  }
}

/* --------------------------------------------------------------------------
   6. SCHEDULES CMS
   -------------------------------------------------------------------------- */
async function loadAdminSchedules() {
  const tbody = document.getElementById('schedulesTableBody');
  if (!tbody) return;

  try {
    const res = await scheduleService.getSchedules();
    const schedules = res.data || [];

    if (schedules.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No live class schedules. Click "Add Live Class" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = schedules.map(s => `
      <tr>
        <td><strong>${s.className}</strong></td>
        <td><span class="badge-status new">${s.dayOfWeek.toUpperCase()}</span></td>
        <td>${s.startTime}</td>
        <td>${s.trainerName}</td>
        <td>${s.locationRoom}</td>
        <td>
          <button class="btn btn-secondary btn-sm delete-sched-btn" data-id="${s._id}" style="color: var(--accent-crimson);"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.delete-sched-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Delete this class schedule?')) {
          try {
            await scheduleService.deleteSchedule(id);
            Toast.success('Class schedule deleted.');
            loadAdminSchedules();
          } catch (err) {
            Toast.error(`Delete failed: ${err.message}`);
          }
        }
      });
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--accent-crimson);">Error loading schedules: ${error.message}</td></tr>`;
  }
}

// Global delegated schedule form listener
document.addEventListener('submit', async (e) => {
  if (e.target && e.target.id === 'scheduleAdminForm') {
    e.preventDefault();

    const payload = {
      className: document.getElementById('schedFormName').value.trim(),
      dayOfWeek: document.getElementById('schedFormDay').value,
      startTime: document.getElementById('schedFormTime').value.trim(),
      trainerName: document.getElementById('schedFormTrainerName').value.trim(),
      locationRoom: document.getElementById('schedFormRoom').value.trim()
    };

    try {
      await scheduleService.createSchedule(payload);
      Toast.success('Live class added to schedule!');
      document.getElementById('scheduleAdminModal').classList.remove('active');
      loadAdminSchedules();
    } catch (err) {
      Toast.error(`Failed to add schedule: ${err.message}`);
    }
  }
});

/* --------------------------------------------------------------------------
   7. INQUIRIES & BOOKINGS CMS WITH AUTOMATED EMAIL DISPATCH
   -------------------------------------------------------------------------- */
async function loadAdminInquiries() {
  const bookingsTbody = document.getElementById('bookingsTableBody');
  const contactsTbody = document.getElementById('contactsTableBody');

  if (bookingsTbody) {
    try {
      const res = await bookingService.getBookings();
      const bookings = res.data || [];

      if (bookings.length === 0) {
        bookingsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No bookings recorded yet. Submit a Free Pass from the website!</td></tr>';
      } else {
        bookingsTbody.innerHTML = bookings.map(b => `
          <tr>
            <td><strong style="color: var(--accent-lime);">${b.confirmationCode}</strong></td>
            <td>${b.type}</td>
            <td>${b.guestName}</td>
            <td>${b.guestEmail}<br><small>${b.guestPhone}</small></td>
            <td><span class="badge-status ${b.status === 'confirmed' ? 'confirmed' : 'new'}">${b.status}</span></td>
            <td>
              <button class="btn btn-outline-lime btn-sm confirm-booking-btn" data-id="${b._id}" data-email="${b.guestEmail}">
                <i class="fa-solid fa-paper-plane"></i> Confirm & Email Receipt
              </button>
            </td>
          </tr>
        `).join('');

        document.querySelectorAll('.confirm-booking-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const email = e.currentTarget.getAttribute('data-email');
            
            setButtonLoading(e.currentTarget, true, 'Sending Mail...');

            try {
              await bookingService.updateStatus(id, 'confirmed');
              Toast.success(`🎉 Booking Confirmed! Email receipt dispatched to ${email}`);
              loadAdminInquiries();
            } catch (err) {
              Toast.error(`Email Dispatch Error: ${err.message}`);
              setButtonLoading(e.currentTarget, false);
            }
          });
        });
      }
    } catch (err) {
      bookingsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--accent-crimson);">${err.message}</td></tr>`;
    }
  }

  if (contactsTbody) {
    try {
      const res = await contactService.getMessages();
      const messages = res.data || [];

      if (messages.length === 0) {
        contactsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No contact messages received yet.</td></tr>';
      } else {
        contactsTbody.innerHTML = messages.map(m => `
          <tr>
            <td>${new Date(m.createdAt).toLocaleDateString()}</td>
            <td><strong>${m.name}</strong></td>
            <td>${m.email}<br><small>${m.phone}</small></td>
            <td><span class="badge-status new">${m.fitnessGoal}</span></td>
            <td style="max-width: 250px;">${m.message}</td>
            <td><span class="badge-status confirmed">${m.status}</span></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      contactsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--accent-crimson);">${err.message}</td></tr>`;
    }
  }
}
