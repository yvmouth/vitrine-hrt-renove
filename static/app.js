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
