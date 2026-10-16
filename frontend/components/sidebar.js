export function initSidebar(onNavigate) {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetView = button.getAttribute('data-view');

      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      if (onNavigate) {
        onNavigate(targetView);
      }
    });
  });
}   