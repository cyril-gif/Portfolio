// ============================================
// Main JavaScript - Portfolio Website
// ============================================

// -----------------------------
// Mobile Navigation Toggle
// -----------------------------
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  const isExpanded = navToggle.classList.contains('active');
  navToggle.setAttribute('aria-expanded', isExpanded);
});

// Close mobile menu when a link is clicked
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  const isNav = e.target.closest('.navbar');
  if (!isNav && navMenu.classList.contains('active')) {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// -----------------------------
// Active Nav Link on Scroll
// -----------------------------
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollY = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);

// -----------------------------
// Scroll Animations (Intersection Observer)
// -----------------------------
const animatedElements = document.querySelectorAll(
  '.about-grid, .skills-category, .project-card, .service-card, .testimonial-card, .timeline-item, .contact-form'
);

// Add fade-up class to all elements we want to animate
animatedElements.forEach((el) => {
  el.classList.add('fade-up');
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }
);

animatedElements.forEach((el) => observer.observe(el));

// Also observe section titles and subtitles
document.querySelectorAll('.section-title, .section-subtitle').forEach((el) => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// -----------------------------
// Contact Form Submission
// -----------------------------
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

// Real-time validation feedback
const formInputs = contactForm.querySelectorAll('input, textarea');
formInputs.forEach((input) => {
  input.addEventListener('blur', () => {
    validateField(input);
  });

  input.addEventListener('input', () => {
    const errorEl = input.parentElement.querySelector('.form-error');
    if (input.classList.contains('error')) {
      validateField(input);
    }
  });
});

function validateField(input) {
  const errorEl = input.parentElement.querySelector('.form-error');
  let isValid = true;
  let errorMessage = '';

  if (input.required && !input.value.trim()) {
    isValid = false;
    errorMessage = `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required`;
  } else if (input.type === 'email' && input.value.trim()) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(input.value.trim())) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  } else if (input.id === 'message' && input.value.trim()) {
    if (input.value.trim().length < 10) {
      isValid = false;
      errorMessage = 'Message must be at least 10 characters';
    }
  }

  if (!isValid) {
    input.classList.add('error');
    errorEl.textContent = errorMessage;
  } else {
    input.classList.remove('error');
    errorEl.textContent = '';
  }

  return isValid;
}

function validateForm() {
  let isValid = true;
  const inputs = contactForm.querySelectorAll('input, textarea');

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Hide any previous status
  formStatus.style.display = 'none';
  formStatus.className = '';

  // Validate form
  if (!validateForm()) {
    // Focus the first invalid field
    const firstError = contactForm.querySelector('.error');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  // Get form data
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      formStatus.className = 'success';
      formStatus.textContent = result.message || '✅ Message sent successfully! I\'ll get back to you soon.';
      formStatus.style.display = 'block';
      contactForm.reset();

      // Remove any error states
      formInputs.forEach((input) => {
        input.classList.remove('error');
        const errorEl = input.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.textContent = '';
      });
    } else {
      // Handle validation errors from server
      let errorMessage = '❌ Something went wrong. Please try again.';

      if (result.errors && Array.isArray(result.errors)) {
        errorMessage = result.errors.map((e) => e.msg).join('. ');
      } else if (result.message) {
        errorMessage = result.message;
      }

      formStatus.className = 'error';
      formStatus.textContent = errorMessage;
      formStatus.style.display = 'block';
    }
  } catch (error) {
    console.error('Form submission error:', error);
    formStatus.className = 'error';
    formStatus.textContent = '❌ Network error. Please check your connection and try again.';
    formStatus.style.display = 'block';
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

// -----------------------------
// Smooth Scroll for anchor links
// -----------------------------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = 70;
      const targetPosition = target.offsetTop - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  });
});

// -----------------------------
// Keyboard accessibility for mobile menu
// -----------------------------
navToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Trap focus inside mobile menu when open
navMenu.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('active')) {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
});

// -----------------------------
// Console greeting
// -----------------------------
console.log('%c🚀 Pascal Lantam Gbate Portfolio', 'font-size: 20px; font-weight: bold; color: #38bdf8;');
console.log('%cFull-Stack Developer & Business Support Specialist', 'font-size: 14px; color: #1a1a2e;');
console.log('%c📍 Based in Upper West Region, Ghana', 'font-size: 14px; color: #2d2d44;');
console.log('%c☀️ Clean White & Sky Blue Theme', 'font-size: 14px; color: #38bdf8;');
console.log('%c👋 Thanks for checking out my portfolio!', 'font-size: 14px; color: #1a1a2e;');

// -----------------------------
// Performance: Lazy load images with Intersection Observer
// -----------------------------
document.querySelectorAll('img[data-src]').forEach((img) => {
  const imgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    },
    { threshold: 0.1 }
  );
  imgObserver.observe(img);
});

// -----------------------------
// Handle resize events (debounced)
// -----------------------------
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Recalculate anything if needed
  }, 250);
});

// -----------------------------
// Parallax effect on hero background
// -----------------------------
const heroBg = document.querySelector('.hero-bg');
const heroBg2 = document.querySelector('.hero-bg-2');
window.addEventListener('scroll', () => {
  if (heroBg) {
    const scrolled = window.scrollY;
    heroBg.style.transform = `translate(${scrolled * 0.02}px, ${scrolled * 0.03}px) scale(1)`;
  }
  if (heroBg2) {
    const scrolled = window.scrollY;
    heroBg2.style.transform = `translate(${-scrolled * 0.015}px, ${scrolled * 0.025}px) scale(1)`;
  }
});

console.log('✅ Portfolio ready!');
