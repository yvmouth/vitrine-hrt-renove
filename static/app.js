// SCRIPT GLOBAL DU SITE
document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------
     MENU BURGER MOBILE
  --------------------------------*/
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const backdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('#main-nav .nav-link');

  if (menuToggle && mainNav && backdrop) {

    function setMenuState(isOpen) {
      menuToggle.classList.toggle('open', isOpen);
      mainNav.classList.toggle('open', isOpen);
      backdrop.classList.toggle('visible', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function toggleMenu() {
      const isOpen = !mainNav.classList.contains('open');
      setMenuState(isOpen);
    }

    function closeMenu() {
      if (mainNav.classList.contains('open')) {
        setMenuState(false);
      }
    }

    // Clic sur l’icône burger
    menuToggle.addEventListener('click', toggleMenu);

    // Clic sur le fond assombri
    backdrop.addEventListener('click', closeMenu);

    // Clic sur un lien du menu
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Touche Echap pour fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
  }

  /* -------------------------------
     CARROUSELS DANS LES CARTES SERVICES
  --------------------------------*/
  const carousels = document.querySelectorAll('[data-carousel]');

  if (carousels.length > 0) {
    carousels.forEach((carousel) => {
      const track = carousel.querySelector('[data-carousel-track]');
      const slides = track ? Array.from(track.querySelectorAll('.carousel__slide')) : [];
      const btnPrev = carousel.querySelector('[data-carousel-prev]');
      const btnNext = carousel.querySelector('[data-carousel-next]');
      const dotsContainer = carousel.querySelector('[data-carousel-dots]');

      // Sécurité : si la structure est incomplète, on ne fait rien
      if (!track || slides.length === 0 || !dotsContainer) return;

      let currentIndex = 0;

      // Création dynamique des petits points
      const dots = slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.classList.add('carousel__dot');
        if (index === 0) dot.classList.add('is-active');

        dot.addEventListener('click', () => {
          currentIndex = index;
          updateCarousel();
        });

        dotsContainer.appendChild(dot);
        return dot;
      });

      function updateCarousel() {
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;

        dots.forEach((dot, index) => {
          dot.classList.toggle('is-active', index === currentIndex);
        });
      }

      function goToNext() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
      }

      function goToPrev() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      }

      // Boutons suivant / précédent
      if (btnNext) btnNext.addEventListener('click', goToNext);
      if (btnPrev) btnPrev.addEventListener('click', goToPrev);

      // Position initiale
      updateCarousel();
    });
  }

  /* -------------------------------
     LIGHTBOX – VISIONNEUSE PLEIN ÉCRAN
     (sur les images des carrousels de SERVICES)
  --------------------------------*/
  // Création de la structure HTML de la lightbox générique
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox__backdrop" data-lightbox-close></div>
    <div class="lightbox__inner">
      <button class="lightbox__btn lightbox__btn--close" type="button" data-lightbox-close aria-label="Fermer l'image">×</button>
      <button class="lightbox__btn lightbox__btn--prev" type="button" data-lightbox-prev aria-label="Image précédente">‹</button>
      <img class="lightbox__img" alt="">
      <button class="lightbox__btn lightbox__btn--next" type="button" data-lightbox-next aria-label="Image suivante">›</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const lbBtnPrev = lightbox.querySelector('[data-lightbox-prev]');
  const lbBtnNext = lightbox.querySelector('[data-lightbox-next]');
  const lbCloseTargets = lightbox.querySelectorAll('[data-lightbox-close]');

  let lbSlides = [];
  let lbIndex = 0;

  function updateLightbox() {
    if (!lbSlides.length) return;
    const slide = lbSlides[lbIndex];
    if (!slide) return;

    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt || '';
  }

  function openLightbox(slides, startIndex) {
    if (!slides || !slides.length) return;

    lbSlides = slides;
    lbIndex = startIndex >= 0 ? startIndex : 0;
    updateLightbox();

    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  }

  function goNextLb() {
    if (!lbSlides.length) return;
    lbIndex = (lbIndex + 1) % lbSlides.length;
    updateLightbox();
  }

  function goPrevLb() {
    if (!lbSlides.length) return;
    lbIndex = (lbIndex - 1 + lbSlides.length) % lbSlides.length;
    updateLightbox();
  }

  // Boutons / fermeture
  lbBtnNext.addEventListener('click', goNextLb);
  lbBtnPrev.addEventListener('click', goPrevLb);
  lbCloseTargets.forEach(el => {
    el.addEventListener('click', closeLightbox);
  });

  // Clavier : Esc, flèches gauche/droite
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      goNextLb();
    } else if (e.key === 'ArrowLeft') {
      goPrevLb();
    }
  });

  // 👉 SWIPE pour la lightbox SERVICES (mobile / tablette)
  const servicesLightboxInner = lightbox.querySelector('.lightbox__inner');
  if (servicesLightboxInner) {
    let svTouchStartX = null;
    let svTouchStartY = null;
    const SV_SWIPE_THRESHOLD = 50;   // min déplacement horizontal
    const SV_VERTICAL_LIMIT = 80;    // max vertical pour éviter conflit avec scroll

    const handleSvTouchStart = (e) => {
      if (window.innerWidth > 991) return;         // seulement mobile / tablette
      if (e.touches.length !== 1) return;
      svTouchStartX = e.touches[0].clientX;
      svTouchStartY = e.touches[0].clientY;
    };

    const handleSvTouchEnd = (e) => {
      if (window.innerWidth > 991) return;
      if (svTouchStartX === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - svTouchStartX;
      const deltaY = touchEndY - svTouchStartY;

      // On s'assure que c'est bien un geste horizontal
      if (Math.abs(deltaX) > SV_SWIPE_THRESHOLD && Math.abs(deltaY) < SV_VERTICAL_LIMIT) {
        if (deltaX < 0) {
          // swipe vers la gauche → image suivante
          goNextLb();
        } else {
          // swipe vers la droite → image précédente
          goPrevLb();
        }
      }

      svTouchStartX = null;
      svTouchStartY = null;
    };

    servicesLightboxInner.addEventListener('touchstart', handleSvTouchStart, { passive: true });
    servicesLightboxInner.addEventListener('touchend', handleSvTouchEnd, { passive: true });
  }

  // Clic sur les images des carrousels de SERVICES pour ouvrir la lightbox
  const carouselSlides = document.querySelectorAll('.carousel__slide');
  carouselSlides.forEach(slide => {
    slide.style.cursor = 'zoom-in';

    slide.addEventListener('click', () => {
      const carousel = slide.closest('[data-carousel]');
      let slides = [];

      if (carousel) {
        const track = carousel.querySelector('[data-carousel-track]');
        slides = track ? Array.from(track.querySelectorAll('.carousel__slide')) : [slide];
      } else {
        slides = [slide];
      }

      const startIndex = slides.indexOf(slide);
      openLightbox(slides, startIndex);
    });
  });

  /* -------------------------------
     ANIMATION REVEAL DES CARTES DE SERVICES
  --------------------------------*/
  const cards = document.querySelectorAll('.service-card');

  if (!('IntersectionObserver' in window)) {
    // Si pas supporté → on affiche tout
    cards.forEach(card => card.classList.add('in-view'));
  } else {
    // Définir la direction d’animation (gauche / droite)
    cards.forEach((card, index) => {
      if (index % 2 === 0) card.classList.add('slide-left');
      else card.classList.add('slide-right');
    });

    const observerServices = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach(card => observerServices.observe(card));
  }

  /* ----------------------------------------------------------
     ANIMATIONS SCROLL – PAGE A PROPOS
     (Soft reveal / fade-in / fade-left / fade-right)
  -----------------------------------------------------------*/
  const revealElements = document.querySelectorAll(
    '.reveal-on-scroll, .reveal-on-scroll-left, .reveal-on-scroll-right'
  );

  if (!('IntersectionObserver' in window) || revealElements.length === 0) {
    // pas supporté → tout visible
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const observerReveal = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerReveal.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealElements.forEach(el => observerReveal.observe(el));
  }

  /* ----------------------------------------------------------
     GALERIE / TECHNIQUES – CARROUSELS + LIGHTBOX
  -----------------------------------------------------------*/

  // 1) Boutons "Voir plus de photos" (scroll doux vers la section cible)
  const scrollButtons = document.querySelectorAll('[data-scroll-target]');
  scrollButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.dataset.scrollTarget;
      if (!targetSelector) return;

      const target = document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 2) Carrousels par technique (.tech-carousel)
  const techCarousels = document.querySelectorAll('.tech-carousel');

  techCarousels.forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.tech-carousel__slide'));
    if (!slides.length) return;

    const btnPrev = carousel.querySelector('.carousel-btn--prev');
    const btnNext = carousel.querySelector('.carousel-btn--next');

    // Les petits points sous le carrousel (on les cherche au niveau de l'article parent)
    const dotsContainer = carousel.parentElement.querySelector('.tech-carousel__dots');
    let dots = [];

    if (dotsContainer) {
      const existingDots = Array.from(dotsContainer.querySelectorAll('.tech-dot'));
      if (existingDots.length === slides.length) {
        dots = existingDots;
      } else {
        dotsContainer.innerHTML = '';
        dots = slides.map((_, index) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'tech-dot';
          if (index === 0) dot.classList.add('is-active');
          dot.dataset.index = String(index);
          dotsContainer.appendChild(dot);
          return dot;
        });
      }
    }

    let currentIndex = 0;

    function updateCarousel() {
      const offset = -currentIndex * 100;
      track.style.transform = `translateX(${offset}%)`;

      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentIndex);
      });
    }

    function goTo(index) {
      // On bloque aux extrémités au lieu de boucler
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      currentIndex = index;
      updateCarousel();
    }

    if (btnPrev) btnPrev.addEventListener('click', () => goTo(currentIndex - 1));
    if (btnNext) btnNext.addEventListener('click', () => goTo(currentIndex + 1));

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index || '0', 10);
        goTo(idx);
      });
    });

    // Position initiale
    updateCarousel();
  });

  // 3) Lightbox dédiée pour la galerie (#gallery-lightbox)
  const galleryLightbox = document.getElementById('gallery-lightbox');

  if (galleryLightbox) {
    const lbBackdrop = galleryLightbox.querySelector('.gallery-lightbox__backdrop');
    const lbCloseButtons = galleryLightbox.querySelectorAll('[data-lightbox-close]');
    const lbPrev = galleryLightbox.querySelector('[data-lightbox-prev]');
    const lbNext = galleryLightbox.querySelector('[data-lightbox-next]');
    const lbImage = document.getElementById('lightbox-image');
    const lbCaption = document.getElementById('lightbox-caption');
    const lbTech = document.getElementById('lightbox-tech');

    const TECH_LABELS = {
      'aerogommage': 'Aérogommage',
      'thermolaquage': 'Thermolaquage',
      'sablage-grenaillage': 'Sablage & Grenaillage',
      'vaporblasting': 'Vaporblasting',
      'cerakote': 'Cerakote',
      'projet1': 'Projet phare 1',
      'projet2': 'Projet phare 2'
    };

    let currentGroup = [];
    let currentIndex = 0;

    function renderGalleryLightbox() {
      if (!currentGroup.length || !lbImage) return;
      const item = currentGroup[currentIndex];

      lbImage.classList.remove('is-visible');

      requestAnimationFrame(() => {
        lbImage.src = item.src;
        lbImage.alt = item.alt || '';

        if (lbCaption) {
          lbCaption.textContent = item.alt || '';
        }

        if (lbTech) {
          const label = item.techKey && TECH_LABELS[item.techKey];
          if (label) {
            lbTech.textContent = label;
            lbTech.style.display = 'block';
          } else {
            lbTech.textContent = '';
            lbTech.style.display = 'none';
          }
        }

        requestAnimationFrame(() => {
          lbImage.classList.add('is-visible');
        });
      });
    }

    function openFromButton(btn) {
      let selector = null;
      let techKey = null;

      if (btn.dataset.gallery) {
        techKey = btn.dataset.gallery;
        selector = `[data-gallery="${btn.dataset.gallery}"]`;
      } else if (btn.dataset.lightbox) {
        techKey = btn.dataset.lightbox;
        selector = `[data-lightbox="${btn.dataset.lightbox}"]`;
      }

      let buttons = [];
      if (selector) {
        buttons = Array.from(document.querySelectorAll(selector));
      } else {
        buttons = [btn];
      }

      currentGroup = buttons.map(b => {
        const img = b.querySelector('img');
        return {
          src: img ? img.src : '',
          alt: img ? img.alt : '',
          techKey: techKey
        };
      });

      currentIndex = buttons.indexOf(btn);
      if (currentIndex < 0) currentIndex = 0;

      renderGalleryLightbox();
      galleryLightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    }

    function closeGalleryLightbox() {
      galleryLightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
    }

    function nextGalleryImage() {
      if (!currentGroup.length) return;
      currentIndex = (currentIndex + 1) % currentGroup.length;
      renderGalleryLightbox();
    }

    function prevGalleryImage() {
      if (!currentGroup.length) return;
      currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
      renderGalleryLightbox();
    }

    // Bind sur toutes les vignettes / images cliquables de la galerie
    const thumbButtons = document.querySelectorAll('.project-thumb, .tech-carousel__image-btn');
    thumbButtons.forEach(btn => {
      btn.addEventListener('click', () => openFromButton(btn));
    });

    lbCloseButtons.forEach(el => el.addEventListener('click', closeGalleryLightbox));
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeGalleryLightbox);
    if (lbNext) lbNext.addEventListener('click', nextGalleryImage);
    if (lbPrev) lbPrev.addEventListener('click', prevGalleryImage);

    document.addEventListener('keydown', (e) => {
      if (galleryLightbox.getAttribute('aria-hidden') === 'true') return;

      if (e.key === 'Escape') closeGalleryLightbox();
      if (e.key === 'ArrowRight') nextGalleryImage();
      if (e.key === 'ArrowLeft') prevGalleryImage();
    });

    // 👉 SWIPE pour la lightbox GALERIE (mobile / tablette)
    const galleryDialog = galleryLightbox.querySelector('.gallery-lightbox__dialog');
    if (galleryDialog && lbNext && lbPrev) {
      let glTouchStartX = null;
      let glTouchStartY = null;
      const GL_SWIPE_THRESHOLD = 50;
      const GL_VERTICAL_LIMIT = 80;

      const handleGlTouchStart = (e) => {
        if (window.innerWidth > 991) return;
        if (e.touches.length !== 1) return;
        glTouchStartX = e.touches[0].clientX;
        glTouchStartY = e.touches[0].clientY;
      };

      const handleGlTouchEnd = (e) => {
        if (window.innerWidth > 991) return;
        if (glTouchStartX === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - glTouchStartX;
        const deltaY = touchEndY - glTouchStartY;

        if (Math.abs(deltaX) > GL_SWIPE_THRESHOLD && Math.abs(deltaY) < GL_VERTICAL_LIMIT) {
          if (deltaX < 0) {
            // gauche → image suivante
            nextGalleryImage();
          } else {
            // droite → image précédente
            prevGalleryImage();
          }
        }

        glTouchStartX = null;
        glTouchStartY = null;
      };

      galleryDialog.addEventListener('touchstart', handleGlTouchStart, { passive: true });
      galleryDialog.addEventListener('touchend', handleGlTouchEnd, { passive: true });
    }
  }

  /* ----------------------------------------------------------
     HEADER – APPARITION PROGRESSIVE SUR LA PAGE D'ACCUEIL
  -----------------------------------------------------------*/
  const body = document.body;

  // On applique l'effet uniquement sur la home (class is-home sur <body>)
  if (body.classList.contains('is-home')) {
    const header = document.querySelector('.site-header');

    if (header) {
      const SHOW_AFTER = 120; // px de scroll avant d'afficher la nav

      const handleHeaderOnScroll = () => {
        // Sur mobile / tablette → header toujours visible
        if (window.innerWidth <= 1023) {
          header.classList.add('is-visible');
          return;
        }

        // Sur desktop → apparition progressive
        if (window.scrollY > SHOW_AFTER) {
          header.classList.add('is-visible');
        } else {
          header.classList.remove('is-visible');
        }
      };

      // Premier check au chargement
      handleHeaderOnScroll();

      // Mise à jour au scroll + au resize (changement mobile/desktop)
      window.addEventListener('scroll', handleHeaderOnScroll);
      window.addEventListener('resize', handleHeaderOnScroll);
    }
  }
  (function () {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target) return;

    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Petite temporisation pour laisser le temps aux images / fonts de se charger
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset - headerHeight - 16; // -16px de marge visuelle

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }, 150);
  })();

});
