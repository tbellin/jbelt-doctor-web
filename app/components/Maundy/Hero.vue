// components/Hero.vue
<template>
  <section id="hero" class="hero section transparent-background">
    <div class="container text-center" data-aos="fade-up" data-aos-delay="100">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h2>{{ $t('hero.title') }}</h2>
          <p>{{ $t('hero.subtitle') }}</p>
        </div>
        <div class="countdown d-flex justify-content-center">
          <div>
            <h3>{{ days }}</h3>
            <h4>{{ $t('hero.countdown.days') }}</h4>
          </div>
          <div>
            <h3>{{ hours }}</h3>
            <h4>{{ $t('hero.countdown.hours') }}</h4>
          </div>
          <div>
            <h3>{{ minutes }}</h3>
            <h4>{{ $t('hero.countdown.minutes') }}</h4>
          </div>
          <div>
            <h3>{{ seconds }}</h3>
            <h4>{{ $t('hero.countdown.seconds') }}</h4>
          </div>
        </div>

        <NewsLetters />
        <div class="social-links">
          <a href="#"><i class="bi bi-twitter-x"></i></a>
          <a href="#"><i class="bi bi-facebook"></i></a>
          <a href="#"><i class="bi bi-instagram"></i></a>
          <a href="#"><i class="bi bi-linkedin"></i></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const { locale } = useI18n();
// console.log(locale.value); // 'en' or 'it'

const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

//const targetDate = new Date();
//targetDate.setDate(targetDate.getDate() + 30);
const targetDate = new Date('2025-01-13T23:39:59');

let countdownInterval: NodeJS.Timer | null = null;
let messageTimeout: NodeJS.Timeout | null = null;

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = targetDate.getTime() - now;

  days.value = Math.floor(distance / (1000 * 60 * 60 * 24));
  hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  seconds.value = Math.floor((distance % (1000 * 60)) / 1000);
};

const showMessage = (message: string, error: boolean = false) => {
  headerMessage.value = message;
  isError.value = error;
  isSuccess.value = !error;

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    headerMessage.value = defaultMessage;
    isError.value = false;
    isSuccess.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  const emailToRegister = email.value;
  email.value = ''; // Pulisce sempre l'input immediatamente

  const result = await registerToNewsletter(emailToRegister);
  showMessage(result.message, !result.success);
};

onMounted(() => {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
});
</script>

<style scoped>
/* Gli stili rimangono identici al file precedente */
.hero-newsletter {
  margin-top: 20px;
}

.newsletter-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.newsletter-form {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #34c38f;
  padding: 5px;
  border-radius: 50px;
  background: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;
}

.newsletter-form input[type="text"] {
  flex-grow: 1;
  width: 100%;
  padding: 10px 20px;
  border: none;
  outline: none;
  background: transparent;
  color: #000000;
  font-size: 1rem;
}

.newsletter-form input[type="text"]::placeholder {
  color: #6c757d;
}

.newsletter-form input[type="text"]:focus {
  outline: none;
  box-shadow: none;
}

.btn-admin {
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  min-width: 120px;
  background-color: #34c38f;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-admin:hover {
  background-color: #2ca97d;
}

.btn-admin:disabled {
  background-color: #34c38f;
  opacity: 0.7;
  cursor: not-allowed;
}

.text-danger {
  color: #ff3333 !important;
  font-size: 0.875rem;
}

.text-success {
  color: #34c38f !important;
  font-size: 0.875rem;
}

.countdown {
  margin: 40px 0;
  gap: 20px;
}

.countdown div {
  padding: 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  min-width: 100px;
}

.countdown h3 {
  font-weight: 700;
  margin-bottom: 5px;
  font-size: 2rem;
  color: #34c38f;
}

.countdown h4 {
  font-size: 1rem;
  color: #6c757d;
}

.social-links {
  margin-top: 30px;
}

.social-links a {
  color: #e59317;
  margin: 0 10px;
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #34c38f;
}
</style>
