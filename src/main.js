// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileBtn && nav) {
    mobileBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      mobileBtn.classList.toggle('active');

      // Animate hamburger bars
      const bars = mobileBtn.querySelectorAll('.bar');
      if (nav.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        mobileBtn.classList.remove('active');

        const bars = mobileBtn.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Modal Logic ---
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.querySelector('.modal-content');
  const modalClose = document.querySelector('.modal-close');

  // Create nav overlays if they don't exist
  let navLeft = document.querySelector('.modal-nav-overlay.left');
  let navRight = document.querySelector('.modal-nav-overlay.right');

  if (!navLeft) {
    navLeft = document.createElement('div');
    navLeft.className = 'modal-nav-overlay left';
    // Removed visible button
    modalContent.appendChild(navLeft);

    // Add click listener to overlay for navigation
    navLeft.addEventListener('click', (e) => {
      if (e.target === navLeft) prevItem();
    });
  }

  if (!navRight) {
    navRight = document.createElement('div');
    navRight.className = 'modal-nav-overlay right';
    // Removed visible button
    modalContent.appendChild(navRight);

    // Add click listener to overlay for navigation
    navRight.addEventListener('click', (e) => {
      if (e.target === navRight) nextItem();
    });
  }

  // Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  modalContent.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modalContent.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 50; // Min distance for swipe
    if (touchEndX < touchStartX - threshold) {
      nextItem();
    }
    if (touchEndX > touchStartX + threshold) {
      prevItem();
    }
  }

  let currentIndex = 0;
  let currentGroup = [];
  let track = null;
  let isTransitioning = false;
  const cloneCount = 2; // Number of clones on each side

  function openModal(index, group, originElement) {
    currentGroup = group;
    currentIndex = index;

    // Build Carousel Structure
    buildCarousel();

    // Initial positioning (no animation)
    updateCarouselPosition(false);

    // Set transform origin for smooth animation
    if (originElement) {
      const rect = originElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const originX = (centerX / window.innerWidth) * 100;
      const originY = (centerY / window.innerHeight) * 100;

      modalContent.style.transformOrigin = `${originX}% ${originY}%`;
    } else {
      modalContent.style.transformOrigin = 'center center';
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Force a recalculation after a brief delay to ensure layout is settled
    setTimeout(() => {
      updateCarouselPosition(false);
    }, 50);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function buildCarousel() {
    // Clear existing content
    const container = document.createElement('div');
    container.className = 'carousel-track-container';

    track = document.createElement('div');
    track.className = 'carousel-track';

    // Create array with clones: [Last2, Last1, ...RealItems..., First1, First2]
    const itemsToRender = [
      ...currentGroup.slice(-cloneCount),
      ...currentGroup,
      ...currentGroup.slice(0, cloneCount)
    ];

    itemsToRender.forEach((item, i) => {
      const slide = document.createElement('div');

      // Determine class based on type
      if (item.type === 'service') {
        slide.className = 'service-carousel-slide';
      } else {
        slide.className = 'carousel-slide image-mode'; // Keep existing for image for now, or update to image-carousel-slide if we update CSS
      }

      // Determine if this is the active slide (visually)
      // The real index 0 is at position 'cloneCount'
      if (i === currentIndex + cloneCount) slide.classList.add('active');

      const content = document.createElement('div');

      if (item.type === 'service') {
        content.className = 'service-slide-content';
        let listHtml = '';
        if (Array.isArray(item.details)) {
          listHtml = `<ul class="service-list">${item.details.map(detail => `<li>${detail}</li>`).join('')}</ul>`;
        } else {
          listHtml = `<p>${item.description}</p>`;
        }

        content.innerHTML = `
          <h3>${item.title}</h3>
          ${listHtml}
          <div style="margin-top: auto; font-size: 3rem; opacity: 0.5;">${item.icon}</div>
        `;
      } else if (item.type === 'image') {
        content.className = 'slide-content'; // Keep original for images
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        content.appendChild(img);
      }

      slide.appendChild(content);
      track.appendChild(slide);

      // Add click listener to slide for navigation
      slide.addEventListener('click', () => {
        const visualIndex = currentIndex + cloneCount;
        // If clicking the next slide
        if (i === visualIndex + 1) {
          nextItem();
        }
        // If clicking the previous slide
        else if (i === visualIndex - 1) {
          prevItem();
        }
        // If clicking the active slide (optional: maybe do nothing or toggle zoom?)
      });
    });

    container.appendChild(track);

    // Replace modal body content
    const existingBody = document.getElementById('modal-body');
    const oldContainer = document.querySelector('.carousel-track-container');

    if (oldContainer) {
      oldContainer.replaceWith(container);
    } else if (existingBody) {
      existingBody.replaceWith(container);
    } else {
      // Insert before the overlays
      modalContent.insertBefore(container, navLeft);
    }

    // Add transition end listener for infinite loop jump
    track.addEventListener('transitionend', handleTransitionEnd);
  }

  function updateCarouselPosition(animate = true) {
    if (!track) return;

    const slideWidth = track.children[0].offsetWidth;
    const containerWidth = track.parentElement.offsetWidth;

    // Calculate visual index (real index + clones at start)
    const visualIndex = currentIndex + cloneCount;

    // Position to center the visual slide
    const targetPos = (visualIndex * slideWidth);
    const offset = (containerWidth / 2) - (slideWidth / 2);
    const translate = -(targetPos - offset);

    if (animate) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translateX(${translate}px)`;

    // Update active class
    Array.from(track.children).forEach((slide, i) => {
      if (i === visualIndex) slide.classList.add('active');
      else slide.classList.remove('active');
    });
  }

  function handleTransitionEnd() {
    if (!track) return;

    // Check if we are at a clone boundary
    // Total slides = currentGroup.length + 2 * cloneCount
    // Real indices are 0 to currentGroup.length - 1

    // If currentIndex went below 0 (e.g. -1), it means we are at visual index (cloneCount - 1)
    // We need to jump to real index (currentGroup.length - 1)

    // Wait, my logic for nextItem/prevItem updates currentIndex directly.
    // Let's adjust that.

    // Actually, it's easier to check the visual index logic inside next/prev
    // But here, I'm updating currentIndex.
    // If I just animated to a "fake" position, I need to jump to the real one.

    // This function is called AFTER the animation finishes.
    // So if we are currently at a "fake" position, we jump.

    // But wait, my updateCarouselPosition uses `currentIndex`.
    // If I set currentIndex to -1, updateCarouselPosition calculates visual index based on that?
    // No, visualIndex = currentIndex + cloneCount.
    // If currentIndex is -1, visualIndex is 1. (Which is a clone of the last item).
    // So if currentIndex is -1, we want to jump to currentIndex = length - 1.

    // Let's refine nextItem/prevItem to allow temporary out-of-bounds indices.

    isTransitioning = false;

    if (currentIndex < 0) {
      currentIndex = currentGroup.length - 1;
      updateCarouselPosition(false);
    } else if (currentIndex >= currentGroup.length) {
      currentIndex = 0;
      updateCarouselPosition(false);
    }
  }

  function nextItem() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarouselPosition(true);
  }

  function prevItem() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarouselPosition(true);
  }

  // Event Listeners for Modal
  if (modalClose) modalClose.addEventListener('click', closeModal);
  // Removed button listeners as buttons are gone

  // Close on click outside
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modalOverlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevItem();
    if (e.key === 'ArrowRight') nextItem();
  });

  // Resize listener to update carousel position
  window.addEventListener('resize', () => {
    if (modalOverlay.classList.contains('active')) {
      updateCarouselPosition();
    }
  });

  // --- Services Data & Events ---
  const servicesData = [
    {
      type: 'service',
      title: 'Diagnostics',
      details: [
        'Check Engine Light Analysis',
        'Vibration & Noise Diagnosis',
        'Performance Issues',
        'Electrical System Testing',
        'Advanced Scan Tools'
      ],
      icon: '🔍'
    },
    {
      type: 'service',
      title: 'Maintenance',
      details: [
        'Oil Changes (Conventional & Synthetic)',
        'Fluid Top-offs & Flushes',
        'Filter Replacements (Air, Cabin, Fuel)',
        'Spark Plug Replacement',
        'Routine Safety Inspections'
      ],
      icon: '🔧'
    },
    {
      type: 'service',
      title: 'Repairs',
      details: [
        'Brake Pads & Rotors',
        'Suspension & Steering',
        'Transmission Services',
        'Engine Repairs',
        'Alternators & Starters'
      ],
      icon: '🚗'
    },
    {
      type: 'service',
      title: 'Inspections',
      details: [
        'Pre-Purchase Inspections',
        'Trip Safety Checks',
        'Fluid Leak Inspections',
        'Brake System Evaluation',
        'Tire Condition Assessment'
      ],
      icon: '📋'
    },
    {
      type: 'service',
      title: 'Battery & Electrical',
      details: [
        'Battery Testing & Replacement',
        'Alternator & Starter Diagnosis',
        'Wiring Repair',
        'Fuse Replacement',
        'Parasitic Draw Testing'
      ],
      icon: '⚡'
    },
    {
      type: 'service',
      title: 'Commercial',
      details: [
        'Fleet Maintenance',
        'Commercial Truck Repair',
        'Van Service',
        'Preventative Maintenance Plans',
        'On-Site Fleet Services'
      ],
      icon: '🚛'
    },
    {
      type: 'service',
      title: 'AC & Heating',
      details: [
        'AC Recharge & Leak Test',
        'Compressor Replacement',
        'Heater Core Flushing',
        'Defroster Tab Repair',
        'Climate Control Diagnosis'
      ],
      icon: '❄️'
    },
    {
      type: 'service',
      title: 'Tires & Wheels',
      details: [
        'TPMS Diagnosis & Repair',
        'Wheel Bearing Replacement',
        'Tire Rotation',
        'Flat Tire Assistance',
        'Tire Pressure Checks'
      ],
      icon: '🛞'
    }
  ];

  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card, index) => {
    card.addEventListener('click', (e) => {
      openModal(index, servicesData, card);
    });
  });

  // --- Gallery Data & Events ---
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const galleryData = Array.from(galleryItems).map(img => ({
    type: 'image',
    src: img.src,
    alt: img.alt
  }));

  galleryItems.forEach((img, index) => {
    img.parentElement.addEventListener('click', (e) => {
      openModal(index, galleryData, img.parentElement);
    });
  });

});
