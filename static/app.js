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
     ANIMATION REVEAL DES CARTES DE SERVICES
  --------------------------------*/
  const cards = document.querySelectorAll('.service-card');

  if (!('IntersectionObserver' in window) || cards.length === 0) {
    cards.forEach(card => card.classList.add('in-view'));
    return;
  }

  // Définir la direction d’animation (gauche / droite)
  cards.forEach((card, index) => {
    if (index % 2 === 0) card.classList.add('slide-left');
    else card.classList.add('slide-right');
  });

  const observer = new IntersectionObserver(
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

  cards.forEach(card => observer.observe(card));
});
