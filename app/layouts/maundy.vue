// layouts/maundy.vue
<template>
  <div class="index-page">
    <!-- Header -->
    <header id="header" class="header d-flex align-items-center px-3 fixed-top">
      <div class="container-fluid position-relative d-flex align-items-center justify-content-between">
        <a href="/" class="logo d-flex align-items-center">
          <h1 class="sitename">Maundy</h1>
        </a>

        <nav id="navmenu" class="navmenu">
          <ul>
            <li><a href="#hero" class="active">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/panel">Dashboard</a></li>
          </ul>
          <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>
      </div>
    </header>

    <slot />

    <!-- Footer -->
    <footer id="footer" class="footer transparent-background">
      <div class="container">
        <div class="row gy-3">
          <div class="col-lg-3 col-md-6 d-flex">
            <i class="bi bi-geo-alt icon"></i>
            <div class="address">
              <h4>Address</h4>
              <p>A108 Adam Street</p>
              <p>New York, NY 535022</p>
              <p></p>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 d-flex">
            <i class="bi bi-telephone icon"></i>
            <div>
              <h4>Contact</h4>
              <p>
                <strong>Phone:</strong> <span>+1 5589 55488 55</span><br>
                <strong>Email:</strong> <span>info@example.com</span><br>
              </p>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 d-flex">
            <i class="bi bi-clock icon"></i>
            <div>
              <h4>Opening Hours</h4>
              <p>
                <strong>Mon-Sat:</strong> <span>11AM - 23PM</span><br>
                <strong>Sunday</strong>: <span>Closed</span>
              </p>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <h4>Follow Us</h4>
            <div class="social-links d-flex">
              <a href="#" class="twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" class="instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" class="linkedin"><i class="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>

      <div class="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong class="px-1 sitename">Maundy</strong> <span>All Rights Reserved</span></p>
        <div class="credits">
          Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
        </div>
      </div>
    </footer>

    <!-- Scroll Top -->
    <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>

    <!-- Preloader -->
    <div id="preloader" v-show="showPreloader"></div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head';
import { onMounted, ref } from 'vue';

const showPreloader = ref(true);

// Configurazione dei link e script per il <head>
useHead({
  title: 'Index - Maundy Bootstrap Template',
  meta: [
    { name: 'description', content: '' },
    { name: 'keywords', content: '' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
  ],
  link: [
    { rel: 'icon', href: '/Maundy/assets/img/favicon.png' },
    { rel: 'apple-touch-icon', href: '/Maundy/assets/img/apple-touch-icon.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap' },
    { rel: 'stylesheet', href: '/Maundy/assets/vendor/bootstrap/css/bootstrap.min.css' },
    { rel: 'stylesheet', href: '/Maundy/assets/vendor/bootstrap-icons/bootstrap-icons.css' },
    { rel: 'stylesheet', href: '/Maundy/assets/vendor/aos/aos.css' },
    { rel: 'stylesheet', href: '/Maundy/assets/css/main.css' }
  ],
  script: [
    { src: '/Maundy/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', defer: true }
  ]
});

// Caricamento client-side e gestione preloader
onMounted(() => {
  // Nascondi il preloader dopo 1 secondo
  setTimeout(() => {
    showPreloader.value = false;
  }, 1000);

  // Carica AOS
  const aosScript = document.createElement('script');
  aosScript.src = '/Maundy/assets/vendor/aos/aos.js';
  aosScript.onload = () => {
    // Inizializza AOS dopo il caricamento
    if (window.AOS) {
      window.AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  };
  document.head.appendChild(aosScript);

  // Carica script principale senza dipendere da AOS
  setTimeout(() => {
    // Implementa direttamente le funzionalità principali senza dipendere dal main.js
    
    // Mobile nav toggle
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    if (mobileNavToggleBtn) {
      function mobileNavToogle() {
        document.querySelector('body').classList.toggle('mobile-nav-active');
        mobileNavToggleBtn.classList.toggle('bi-list');
        mobileNavToggleBtn.classList.toggle('bi-x');
      }
      mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }

    // Scroll top button
    const scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
      function toggleScrollTop() {
        window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
      }
      scrollTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
      window.addEventListener('scroll', toggleScrollTop);
      toggleScrollTop();
    }

    // Countdown timer
    function updateCountDown(countDownItem) {
      const timeleft = new Date(countDownItem.getAttribute('data-count')).getTime() - new Date().getTime();
      const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      const daysEl = countDownItem.querySelector('.count-days');
      const hoursEl = countDownItem.querySelector('.count-hours');
      const minutesEl = countDownItem.querySelector('.count-minutes');
      const secondsEl = countDownItem.querySelector('.count-seconds');

      if (daysEl) daysEl.innerHTML = days;
      if (hoursEl) hoursEl.innerHTML = hours;
      if (minutesEl) minutesEl.innerHTML = minutes;
      if (secondsEl) secondsEl.innerHTML = seconds;
    }

    document.querySelectorAll('.countdown').forEach(function(countDownItem) {
      updateCountDown(countDownItem);
      setInterval(function() {
        updateCountDown(countDownItem);
      }, 1000);
    });
    
  }, 300);
});
</script>