const menuToggle = document.querySelector('.menu-toggle');
const header = document.querySelector('.header');
const nav = document.querySelector('nav.menu_body');

menuToggle.addEventListener('click', function() {
  header.classList.toggle('active');
  nav.classList.toggle('active');
  menuToggle.classList.toggle('active');
});

window.addEventListener('resize', function() {
  // Если ширина окна становится больше 800px – сбрасываем мобильное состояние
  if (window.innerWidth >= 800) {
    header.classList.remove('active');
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
  }
});




