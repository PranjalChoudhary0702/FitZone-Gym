/* ==========================================================================
   FITZONE GYM - FRONTEND API INTEGRATION & INTERACTIVITY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initHeroCounters();
  initFaqAccordion();
  initModals();

  // API Driven Dynamic Data Loaders
  loadMembershipPlans();
  loadTrainers();
  initScheduleTabs();
  initFormSubmissions();
  initProgramFilters();

  // Set minimum selectable date to today
  const trialDateInput = document.getElementById('trialDate');
  if (trialDateInput) {
    trialDateInput.min = new Date().toISOString().split('T')[0];
  }
});

/* --------------------------------------------------------------------------
   1. NAVBAR STICKY & SCROLLSPY
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   2. MOBILE NAVIGATION DRAWER
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    mobileNav.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileNav.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMenu);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* --------------------------------------------------------------------------
   3. HERO STATS COUNTER
   -------------------------------------------------------------------------- */
function initHeroCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  function runCounters() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const rect = heroSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight && !animated) {
      animated = true;

      statNumbers.forEach(counter => {
        const target = counter.getAttribute('data-target');
        if (!target) return;

        const isDecimal = target.includes('.');
        const isPlus = target.includes('+');
        const isPercent = target.includes('%');
        
        const numericVal = parseFloat(target.replace(/[^0-9.]/g, ''));
        const duration = 1800;
        const steps = 60;
        const stepTime = duration / steps;
        const increment = numericVal / steps;

        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numericVal) {
            current = numericVal;
            clearInterval(timer);
          }

          let formatted = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
          if (isPlus) formatted += '+';
          if (isPercent) formatted += '%';

          counter.textContent = formatted;
        }, stepTime);
      });
    }
  }

  window.addEventListener('scroll', runCounters);
  runCounters();
}

/* --------------------------------------------------------------------------
   4. PROGRAM FILTER TABS
   -------------------------------------------------------------------------- */
function initProgramFilters() {
  const tabBtns = document.querySelectorAll('#programTabs .tab-btn');
  const programCards = document.querySelectorAll('.program-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      programCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. API DRIVEN MEMBERSHIP PLANS & TOGGLE
   -------------------------------------------------------------------------- */
async function loadMembershipPlans() {
  const pricingContainer = document.getElementById('pricingGrid');
  if (!pricingContainer) return;

  // Show Skeleton Loader
  pricingContainer.innerHTML = Array(3).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-text" style="height: 24px; width: 50%;"></div>
      <div class="skeleton skeleton-text" style="height: 14px; margin-bottom: 20px;"></div>
      <div class="skeleton skeleton-text" style="height: 48px; width: 70%; margin-bottom: 30px;"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>
  `).join('');

  try {
    const res = await planService.getPlans();
    const plans = res.data || [];

    if (plans.length === 0) {
      pricingContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No membership plans available.</p>';
      return;
    }

    renderPricingCards(plans);
    initPricingToggle(plans);
  } catch (error) {
    pricingContainer.innerHTML = `
      <div class="retry-banner" style="grid-column: 1/-1;">
        <p><i class="fa-solid fa-triangle-exclamation text-crimson"></i> Failed to load membership plans: ${error.message}</p>
        <button class="btn btn-outline-lime btn-sm" onclick="loadMembershipPlans()"><i class="fa-solid fa-rotate-right"></i> Retry Loading Plans</button>
      </div>
    `;
  }
}

function renderPricingCards(plans) {
  const pricingContainer = document.getElementById('pricingGrid');
  const toggleInput = document.getElementById('billingToggle');
  const isAnnual = toggleInput ? toggleInput.checked : false;

  pricingContainer.innerHTML = plans.map(plan => `
    <div class="pricing-card ${plan.isPopular ? 'popular' : ''}">
      ${plan.isPopular ? `<div class="popular-badge">${plan.badgeText || 'MOST POPULAR'}</div>` : ''}
      <div class="pricing-header">
        <h3>${plan.name}</h3>
        <p>Targeted access tailored for your fitness goals.</p>
      </div>
      <div class="pricing-amount">
        <span class="currency">$</span>
        <span class="price price-val">${isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice}</span>
        <span class="period price-period">${isAnnual ? '/month (billed annually)' : `/${plan.billingPeriod || 'month'}`}</span>
      </div>
      <div class="pricing-features">
        ${plan.features.map(f => `<div class="pricing-feature-item"><i class="fa-solid fa-check"></i> ${f}</div>`).join('')}
        ${(plan.disabledFeatures || []).map(f => `<div class="pricing-feature-item disabled"><i class="fa-solid fa-xmark"></i> ${f}</div>`).join('')}
      </div>
      <button class="btn ${plan.isPopular ? 'btn-primary' : 'btn-secondary'} trigger-trial-modal" data-plan="${plan.name}">
        ${plan.isPopular ? 'Start 3-Day Free Trial' : 'Select Plan'}
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.trigger-trial-modal').forEach(btn => {
    btn.addEventListener('click', openTrialModal);
  });
}

function initPricingToggle(plans) {
  const toggleInput = document.getElementById('billingToggle');
  if (!toggleInput) return;

  toggleInput.addEventListener('change', () => {
    renderPricingCards(plans);
  });
}

/* --------------------------------------------------------------------------
   6. API DRIVEN TRAINERS
   -------------------------------------------------------------------------- */
async function loadTrainers() {
  const trainersContainer = document.getElementById('trainersGrid');
  if (!trainersContainer) return;

  // Show Skeleton Loader
  trainersContainer.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton-card" style="height: 380px;">
      <div class="skeleton" style="height: 200px; margin-bottom: 15px;"></div>
      <div class="skeleton skeleton-text" style="height: 20px; width: 70%;"></div>
      <div class="skeleton skeleton-text" style="height: 14px; width: 50%; margin-bottom: 15px;"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
  `).join('');

  try {
    const res = await trainerService.getTrainers();
    const trainers = res.data || [];

    if (trainers.length === 0) {
      trainersContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No trainers found.</p>';
      return;
    }

    trainersContainer.innerHTML = trainers.map(t => `
      <div class="trainer-card">
        <div class="trainer-img-wrapper">
          <img src="${t.imageUrl}" loading="lazy" alt="${t.name}">
          <div class="trainer-overlay">
            <div class="trainer-name">${t.name}</div>
            <div class="trainer-role">${t.role}</div>
          </div>
        </div>
        <div class="trainer-info">
          <div class="trainer-tags">
            ${(t.certifications || []).map(c => `<span class="trainer-tag">${c}</span>`).join('')}
            <span class="trainer-tag">${t.experienceYears}+ Yrs Exp</span>
          </div>
          <button class="btn btn-outline-lime btn-sm trigger-trial-modal" style="width: 100%;">Book Consultation</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.trigger-trial-modal').forEach(btn => {
      btn.addEventListener('click', openTrialModal);
    });
  } catch (error) {
    trainersContainer.innerHTML = `
      <div class="retry-banner" style="grid-column: 1/-1;">
        <p><i class="fa-solid fa-triangle-exclamation text-crimson"></i> Unable to load trainers: ${error.message}</p>
        <button class="btn btn-outline-lime btn-sm" onclick="loadTrainers()"><i class="fa-solid fa-rotate-right"></i> Retry Loading Trainers</button>
      </div>
    `;
  }
}

/* --------------------------------------------------------------------------
   7. API DRIVEN CLASS SCHEDULE
   -------------------------------------------------------------------------- */
function initScheduleTabs() {
  const dayBtns = document.querySelectorAll('.day-btn');
  dayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dayBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const day = btn.getAttribute('data-day');
      fetchAndRenderSchedule(day);
    });
  });

  fetchAndRenderSchedule('mon');
}

async function fetchAndRenderSchedule(dayKey) {
  const scheduleContainer = document.getElementById('scheduleGrid');
  if (!scheduleContainer) return;

  scheduleContainer.innerHTML = Array(4).fill(0).map(() => `
    <div class="schedule-row skeleton-card" style="min-height: 70px; padding: 1rem;">
      <div class="skeleton skeleton-text" style="width: 80px;"></div>
      <div class="skeleton skeleton-text" style="width: 60%;"></div>
      <div class="skeleton skeleton-text" style="width: 100px;"></div>
    </div>
  `).join('');

  try {
    const res = await scheduleService.getSchedules(dayKey);
    const classes = res.data || [];

    if (classes.length === 0) {
      scheduleContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md);">
          <p style="color: var(--text-secondary);">No scheduled classes for this day.</p>
        </div>
      `;
      return;
    }

    scheduleContainer.innerHTML = classes.map(c => `
      <div class="schedule-row">
        <div class="schedule-time">${c.startTime}</div>
        <div class="schedule-info">
          <h4>${c.className}</h4>
          <span>${c.intensityTag} • ${c.locationRoom}</span>
        </div>
        <div class="schedule-trainer">Coach: <strong>${c.trainerName || 'FitZone Coach'}</strong></div>
        <div>
          <button class="btn btn-outline-lime btn-sm book-class-btn" data-id="${c._id}" data-class="${c.className}" data-time="${c.startTime}">
            Book Seat
          </button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.book-class-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const classId = e.target.getAttribute('data-id');
        const className = e.target.getAttribute('data-class');
        const classTime = e.target.getAttribute('data-time');
        openBookingModal(classId, className, classTime);
      });
    });
  } catch (error) {
    scheduleContainer.innerHTML = `
      <div class="retry-banner">
        <p><i class="fa-solid fa-triangle-exclamation text-crimson"></i> Failed to load class schedule: ${error.message}</p>
        <button class="btn btn-outline-lime btn-sm" onclick="fetchAndRenderSchedule('${dayKey}')"><i class="fa-solid fa-rotate-right"></i> Retry Loading Schedule</button>
      </div>
    `;
  }
}

/* --------------------------------------------------------------------------
   8. INTERACTIVE FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. MODAL DIALOGS & ESC DISMISS
   -------------------------------------------------------------------------- */
function initModals() {
  const modals = document.querySelectorAll('.modal-overlay');
  const closeBtns = document.querySelectorAll('.modal-close');

  const closeModal = () => {
    modals.forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  };

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });

  // ESC Key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openTrialModal(e) {
  if (e) e.preventDefault();
  const trialModal = document.getElementById('trialModal');
  if (trialModal) {
    trialModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function openBookingModal(classId, className, classTime) {
  const bookingModal = document.getElementById('bookingModal');
  const classInput = document.getElementById('bookingClassName');
  const idInput = document.getElementById('bookingScheduleId');

  if (bookingModal && classInput) {
    classInput.value = `${className} (${classTime})`;
    if (idInput) idInput.value = classId;
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/* --------------------------------------------------------------------------
   10. FORM SUBMISSIONS TO MONGODB REST API
   -------------------------------------------------------------------------- */
function setButtonLoading(button, isLoading, loadingText = 'Processing...') {
  if (isLoading) {
    button.setAttribute('data-original-text', button.innerHTML);
    button.disabled = true;
    button.innerHTML = `<span class="spinner-sm"></span> ${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
  }
}

function initFormSubmissions() {
  // 1. Free Trial Form Submission
  const trialForm = document.getElementById('trialForm');
  if (trialForm) {
    trialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = trialForm.querySelector('button[type="submit"]');

      const payload = {
        type: 'Free Trial Pass',
        guestName: document.getElementById('trialName').value.trim(),
        guestEmail: document.getElementById('trialEmail').value.trim(),
        guestPhone: document.getElementById('trialPhone').value.trim(),
        startDate: document.getElementById('trialDate').value || new Date()
      };

      setButtonLoading(submitBtn, true, 'Generating VIP Pass...');

      try {
        const res = await bookingService.createBooking(payload);
        const code = res.data?.confirmationCode || 'FZ-PASS';
        Toast.success(`🎉 SUCCESS! Your 3-Day VIP Pass [${code}] has been saved to MongoDB. Present at reception!`);
        trialForm.reset();
        document.getElementById('trialModal').classList.remove('active');
        document.body.style.overflow = '';
      } catch (error) {
        Toast.error(`Booking Failed: ${error.message}`);
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // 2. Class Seat Booking Form Submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = bookingForm.querySelector('button[type="submit"]');

      const schedId = document.getElementById('bookingScheduleId')?.value?.trim();
      const payload = {
        type: 'Class Reservation',
        classScheduleId: schedId && schedId !== 'null' ? schedId : null,
        className: document.getElementById('bookingClassName').value,
        guestName: document.getElementById('bookName').value.trim(),
        guestEmail: document.getElementById('bookEmail').value.trim(),
        guestPhone: document.getElementById('bookPhone').value.trim()
      };

      setButtonLoading(submitBtn, true, 'Reserving Seat...');

      try {
        const res = await bookingService.createBooking(payload);
        const code = res.data?.confirmationCode || 'FZ-BOOKED';
        Toast.success(`👍 Seat Confirmed! Reservation Code: ${code}`);
        bookingForm.reset();
        document.getElementById('bookingModal').classList.remove('active');
        document.body.style.overflow = '';
      } catch (error) {
        Toast.error(`Reservation Error: ${error.message}`);
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // 3. Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const payload = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        fitnessGoal: document.getElementById('contactGoal').value,
        message: document.getElementById('contactMessage').value.trim()
      };

      setButtonLoading(submitBtn, true, 'Sending Message...');

      try {
        await contactService.submitMessage(payload);
        Toast.success('✅ Inquiry Received! A FitZone specialist will reach out within 2 business hours.');
        contactForm.reset();
      } catch (error) {
        Toast.error(`Failed to send message: ${error.message}`);
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }
}
