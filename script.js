/* ==========================================
   YAKULT SLIDESHOW — script.js
   ========================================== */

(function () {
  'use strict';

  const container = document.getElementById('slideshowContainer');
  const scrollArrow = document.getElementById('scrollArrow');
  const scrollDots = document.getElementById('scrollDots');
  const dotList = document.getElementById('dotList');

  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  const lastSlideIndex = totalSlides - 1;

  // ---- Build dot indicators ----
  slides.forEach((_, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Pergi ke slide ${i + 1}`);
    btn.setAttribute('data-dot', i);
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => scrollToSlide(i));
    li.appendChild(btn);
    dotList.appendChild(li);
  });

  const dots = Array.from(dotList.querySelectorAll('button'));

  // ---- Scroll to slide ----
  function scrollToSlide(index) {
    const target = slides[index];
    if (!target) return;
    container.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth',
    });
  }

  // ---- Determine current slide from scroll position ----
  function getActiveSlideIndex() {
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    return Math.round(scrollTop / height);
  }

  // ---- Update dots ----
  function updateDots(index) {
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  // ---- Update scroll arrow visibility ----
  function updateScrollArrow(index) {
    if (index >= lastSlideIndex) {
      scrollArrow.classList.add('hidden');
    } else {
      scrollArrow.classList.remove('hidden');
    }
  }

  // ---- IntersectionObserver for slide animations ----
  const observerOptions = {
    root: container,
    threshold: 0.4,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        // Remove class so animation replays on re-entry
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);

  slides.forEach((slide) => observer.observe(slide));

  // ---- Scroll event for dots + arrow ----
  let scrollTimer = null;

  container.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const idx = getActiveSlideIndex();
      updateDots(idx);
      updateScrollArrow(idx);
    }, 50);
  }, { passive: true });

  // ---- Keyboard navigation ----
  document.addEventListener('keydown', (e) => {
    const idx = getActiveSlideIndex();
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSlide(Math.min(idx + 1, lastSlideIndex));
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSlide(Math.max(idx - 1, 0));
    }
  });

  // ---- Touch swipe support (extra reliability) ----
  let touchStartY = 0;
  let isSwiping = false;

  container.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  container.addEventListener('touchmove', () => {
    isSwiping = true;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    const idx = getActiveSlideIndex();
    if (Math.abs(dy) > 40) {
      if (dy > 0) {
        scrollToSlide(Math.min(idx + 1, lastSlideIndex));
      } else {
        scrollToSlide(Math.max(idx - 1, 0));
      }
    }
  }, { passive: true });

  // ---- Click scroll arrow ----
  scrollArrow.addEventListener('click', () => {
    const idx = getActiveSlideIndex();
    scrollToSlide(Math.min(idx + 1, lastSlideIndex));
  });

  // ---- Background Music ----
  const bgMusic  = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicBtn');
  const musicIcon = document.getElementById('musicIcon');

  bgMusic.volume = 0.45;

  function setPlaying(isPlaying) {
    if (isPlaying) {
      musicIcon.textContent = '♪';
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('aria-label', 'Matikan musik');
    } else {
      musicIcon.textContent = '♩';
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('aria-label', 'Nyalakan musik');
    }
  }

  // Try autoplay immediately
  bgMusic.play().then(() => {
    setPlaying(true);
  }).catch(() => {
    // Autoplay blocked — wait for first user interaction
    setPlaying(false);
    const playOnInteraction = () => {
      bgMusic.play().then(() => {
        setPlaying(true);
      }).catch(() => {});
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
      document.removeEventListener('keydown', playOnInteraction);
    };
    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });
    document.addEventListener('keydown', playOnInteraction, { once: true });
  });

  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
      bgMusic.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      bgMusic.pause();
      setPlaying(false);
    }
  });

  // ---- Init ----
  updateScrollArrow(0);
  // Trigger first slide in-view manually in case observer fires before load
  setTimeout(() => {
    if (slides[0]) slides[0].classList.add('in-view');
  }, 100);

})();
