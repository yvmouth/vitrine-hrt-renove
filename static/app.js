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

      // Optionnel : autoplay (décommenter si tu veux l'activer)
      // let autoplay = setInterval(goToNext, 5000);
      // carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
      // carousel.addEventListener('mouseleave', () => {
      //   autoplay = setInterval(goToNext, 5000);
      // });

      // Position initiale
      updateCarousel();
    });
  }

  /* -------------------------------
     LIGHTBOX – VISIONNEUSE PLEIN ÉCRAN
     (sur les images des carrousels)
  --------------------------------*/
  // Création de la structure HTML de la lightbox
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

  // Clic sur les images des carrousels pour ouvrir la lightbox
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
     GALERIE – FILTRES, MODAL, CARROUSELS
  -----------------------------------------------------------*/
  const galleryPage = document.querySelector('.gallery-page');

  if (galleryPage) {
    // --- Filtres par technique ---
    const filterButtons = galleryPage.querySelectorAll('.gallery-filters .btn-chip');
    // Tous les blocs liés à une technique : cartes principales + carrousels
    const techniqueBlocks = galleryPage.querySelectorAll('.gallery-technique, .gallery-carousel-block');
    // Pour le comptage, on garde juste les sections principales
    const techniqueSections = galleryPage.querySelectorAll('.gallery-technique');

    if (filterButtons.length && techniqueBlocks.length) {
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
        const filter = btn.dataset.filter || 'all';

        filterButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

          techniqueBlocks.forEach(block => {
        const tech = block.dataset.technique;
        if (filter === 'all' || tech === filter) {
          block.style.display = '';
        } else {
          block.style.display = 'none';
        }
      });
    });
  });
}

    // --- Compteurs de projets ---
    const galleryProjectCards = Array.from(galleryPage.querySelectorAll('.gallery-card'));
    const allCountEl = document.getElementById('filter-count-all');
    if (allCountEl) {
      allCountEl.textContent = galleryProjectCards.length.toString();
    }

    // Compte par section
    techniqueSections.forEach(section => {
      const countSpan = section.querySelector('.gallery-technique__count');
      if (countSpan) {
        const count = section.querySelectorAll('.gallery-card').length;
        countSpan.textContent = count.toString();
      }
    });

    // --- Modal / lightbox interne pour les projets ---
    const projectModal = document.getElementById('project-modal');
    if (projectModal && galleryProjectCards.length) {
      const modalBackdrop = projectModal.querySelector('.project-modal__backdrop');
      const modalCloseButtons = projectModal.querySelectorAll('.js-close-project');
      const modalTitle = projectModal.querySelector('#project-modal-title');
      const modalTechnique = projectModal.querySelector('#project-modal-technique');
      const modalDescription = projectModal.querySelector('#project-modal-description');
      const modalIndex = projectModal.querySelector('#project-modal-index');
      const modalImageContainer = projectModal.querySelector('#project-modal-image');
      const modalStateLabel = projectModal.querySelector('#project-modal-state-label');
      const toggleButtons = projectModal.querySelectorAll('.project-modal__toggle-btn');
      const btnPrevProject = projectModal.querySelector('.js-modal-prev');
      const btnNextProject = projectModal.querySelector('.js-modal-next');

      let currentProjectIndex = 0;
      let currentView = 'before'; // 'before' ou 'after'
      let currentBeforeSrc = '';
      let currentAfterSrc = '';

      function renderModalImage(src, fallbackLabel) {
        if (!modalImageContainer) return;
        if (!src) {
          modalImageContainer.innerHTML =
            `<div class="project-modal__image-empty">${fallbackLabel || 'Image à venir'}</div>`;
        } else {
          const safeSrc = src;
          const titleText = modalTitle ? modalTitle.textContent || '' : '';
          modalImageContainer.innerHTML =
            `<img src="${safeSrc}" alt="${titleText}" class="project-modal__image">`;
        }
      }

      function setView(view) {
        currentView = view;

        toggleButtons.forEach(btn => {
          const v = btn.dataset.view;
          btn.classList.toggle('is-active', v === view);
        });

        if (modalStateLabel) {
          modalStateLabel.textContent = view === 'before' ? 'Avant' : 'Après';
        }

        if (view === 'before') {
          renderModalImage(currentBeforeSrc, 'Visualisation avant traitement');
        } else {
          renderModalImage(currentAfterSrc, 'Visualisation après traitement');
        }
      }

      function fillModalFromCard(card, index) {
        currentProjectIndex = index;

        const titleEl = card.querySelector('.gallery-card__title');
        const descEl = card.querySelector('.gallery-card__text');
        const technique = card.dataset.technique || '';
        const beforeSrc = card.dataset.before || card.getAttribute('data-before-src') || '';
        const afterSrc = card.dataset.after || card.getAttribute('data-after-src') || '';

        currentBeforeSrc = beforeSrc;
        currentAfterSrc = afterSrc;

        if (modalTitle && titleEl) modalTitle.textContent = titleEl.textContent.trim();
        if (modalDescription && descEl) modalDescription.textContent = descEl.textContent.trim();
        if (modalTechnique) {
          // Capitalise la première lettre pour l’affichage
          modalTechnique.textContent =
            technique.charAt(0).toUpperCase() + technique.slice(1);
        }
        if (modalIndex) {
          modalIndex.textContent = `${index + 1} / ${galleryProjectCards.length}`;
        }

        setView('before');
      }

      function openProjectModal(card) {
        const index = galleryProjectCards.indexOf(card);
        if (index === -1) return;

        fillModalFromCard(card, index);
        projectModal.classList.add('is-open');
        document.body.classList.add('project-modal-open');
      }

      function closeProjectModal() {
        projectModal.classList.remove('is-open');
        document.body.classList.remove('project-modal-open');
      }

      // Ouverture depuis les cartes
      const openButtons = galleryPage.querySelectorAll('.js-open-project');
      openButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.gallery-card');
          if (card) openProjectModal(card);
        });
      });

      // Fermeture
      modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', closeProjectModal);
      });
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeProjectModal);
      }

      // Navigation entre projets
      function showProjectByOffset(offset) {
        const total = galleryProjectCards.length;
        currentProjectIndex = (currentProjectIndex + offset + total) % total;
        const card = galleryProjectCards[currentProjectIndex];
        fillModalFromCard(card, currentProjectIndex);
      }

      if (btnPrevProject) {
        btnPrevProject.addEventListener('click', () => showProjectByOffset(-1));
      }
      if (btnNextProject) {
        btnNextProject.addEventListener('click', () => showProjectByOffset(1));
      }

      // Boutons Avant / Après
      toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const view = btn.dataset.view || 'before';
          setView(view);
        });
      });

      // Clavier dans le modal
      document.addEventListener('keydown', (e) => {
        if (!projectModal.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
          closeProjectModal();
        } else if (e.key === 'ArrowRight') {
          showProjectByOffset(1);
        } else if (e.key === 'ArrowLeft') {
          showProjectByOffset(-1);
        }
      });
    }

    // --- Carrousels "autres réalisations" (Sablage, etc.) ---
    const galleryCarousels = galleryPage.querySelectorAll('.gallery-carousel');
    if (galleryCarousels.length) {
      galleryCarousels.forEach(carousel => {
        const track = carousel.querySelector('.gallery-carousel__track');
        const slides = track ? Array.from(track.querySelectorAll('.gallery-carousel__slide')) : [];
        const btnPrev = carousel.querySelector('.js-carousel-prev');
        const btnNext = carousel.querySelector('.js-carousel-next');

        if (!track || slides.length === 0) return;

        function scrollBySlide(direction) {
          const slideWidth = slides[0].offsetWidth || 0;
          if (!slideWidth) return;
          track.scrollBy({
            left: direction * slideWidth,
            behavior: 'smooth'
          });
        }

        if (btnPrev) {
          btnPrev.addEventListener('click', () => scrollBySlide(-1));
        }
        if (btnNext) {
          btnNext.addEventListener('click', () => scrollBySlide(1));
        }
      });
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

});
