<!-- app/pages/web.vue -->
<template>
  <main class="main">
    <!-- Hero Section -->
    <section id="hero" class="hero section transparent-background">
      <div class="container text-center" data-aos="fade-up" data-aos-delay="100">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <h2>Maundy<br></h2>
            <p>We are still working on our website. Stay tuned for updates!</p>
          </div>
          <div class="countdown d-flex justify-content-center" data-count="2025/12/3">
            <div>
              <h3 class="count-days">482</h3>
              <h4>Days</h4>
            </div>
            <div>
              <h3 class="count-hours">6</h3>
              <h4>Hours</h4>
            </div>
            <div>
              <h3 class="count-minutes">49</h3>
              <h4>Minutes</h4>
            </div>
            <div>
              <h3 class="count-seconds">21</h3>
              <h4>Seconds</h4>
            </div>
          </div>

          <div class="col-lg-5 hero-newsletter">
            <p>Subscribe now to get the latest updates!</p>
            <form @submit.prevent="handleNewsletterSubmit" class="php-email-form">
              <div class="newsletter-form">
                <input 
                  type="email" 
                  name="newsletter" 
                  v-model="newsletterEmail"
                  :disabled="newsletterLoading"
                  placeholder="Enter your email"
                  style="color: #333333 !important;"
                  required
                >
                <input 
                  type="submit" 
                  value="Subscribe"
                  :disabled="newsletterLoading"
                >
              </div>
              <div class="newsletter-loading" v-show="newsletterLoading">Sending subscription...</div>
              <div class="newsletter-error" v-show="newsletterError">{{ newsletterError }}</div>
              <div class="newsletter-success" v-show="newsletterSuccess">{{ newsletterSuccess }}</div>
            </form>
          </div>

          <div class="social-links">
            <a href="#"><i class="bi bi-twitter-x"></i></a>
            <a href="#"><i class="bi bi-facebook"></i></a>
            <a href="#"><i class="bi bi-instagram"></i></a>
            <a href="#"><i class="bi bi-linkedin"></i></a>
          </div>

        </div>
      </div>
    </section><!-- /Hero Section -->

    <!-- About Section -->
    <section id="about" class="about section transparent-background">
      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <h2>About</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div><!-- End Section Title -->

      <div class="container">
        <div class="row gy-5">
          <div class="content col-xl-5 d-flex flex-column" data-aos="fade-up" data-aos-delay="100">
            <h3>Voluptatem dignissimos provident quasi</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit
            </p>
          </div>

          <div class="col-xl-7" data-aos="fade-up" data-aos-delay="200">
            <div class="row gy-4">
              <div class="col-md-6 icon-box position-relative">
                <i class="bi bi-briefcase"></i>
                <h4><a href="" class="stretched-link">Corporis voluptates sit</a></h4>
                <p>Consequuntur sunt aut quasi enim aliquam quae harum pariatur laboris nisi ut aliquip</p>
              </div><!-- Icon-Box -->

              <div class="col-md-6 icon-box position-relative">
                <i class="bi bi-gem"></i>
                <h4><a href="" class="stretched-link">Ullamco laboris nisi</a></h4>
                <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt</p>
              </div><!-- Icon-Box -->

              <div class="col-md-6 icon-box position-relative">
                <i class="bi bi-broadcast"></i>
                <h4><a href="" class="stretched-link">Labore consequatur</a></h4>
                <p>Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut maiores omnis facere</p>
              </div><!-- Icon-Box -->

              <div class="col-md-6 icon-box position-relative">
                <i class="bi bi-easel"></i>
                <h4><a href="" class="stretched-link">Beatae veritatis</a></h4>
                <p>Expedita veritatis consequuntur nihil tempore laudantium vitae denat pacta</p>
              </div><!-- Icon-Box -->

            </div>
          </div>
        </div>
      </div>
    </section><!-- /About Section -->

    <!-- Contact Section -->
    <section id="contact" class="contact section transparent-background">
      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <h2>Contact</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div><!-- End Section Title -->

      <div class="container" data-aos="fade" data-aos-delay="100">
        <div class="row gy-4">
          <div class="col-lg-4">
            <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="200">
              <i class="bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>Address</h3>
                <p>A108 Adam Street, New York, NY 535022</p>
              </div>
            </div><!-- End Info Item -->

            <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="300">
              <i class="bi bi-telephone flex-shrink-0"></i>
              <div>
                <h3>Call Us</h3>
                <p>+1 5589 55488 55</p>
              </div>
            </div><!-- End Info Item -->

            <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="400">
              <i class="bi bi-envelope flex-shrink-0"></i>
              <div>
                <h3>Email Us</h3>
                <p>info@example.com</p>
              </div>
            </div><!-- End Info Item -->
          </div>

          <div class="col-lg-8">
            <form action="forms/contact.php" method="post" class="php-email-form" data-aos="fade-up" data-aos-delay="200">
              <div class="row gy-4">
                <div class="col-md-6">
                  <input type="text" name="name" class="form-control" placeholder="Your Name" required>
                </div>

                <div class="col-md-6 ">
                  <input type="email" class="form-control" name="email" placeholder="Your Email" required>
                </div>

                <div class="col-md-12">
                  <input type="text" class="form-control" name="subject" placeholder="Subject" required>
                </div>

                <div class="col-md-12">
                  <textarea class="form-control" name="message" rows="6" placeholder="Message" required></textarea>
                </div>

                <div class="col-md-12 text-center">
                  <div class="loading">Loading</div>
                  <div class="error-message"></div>
                  <div class="sent-message">Your message has been sent. Thank you!</div>

                  <button type="submit">Send Message</button>
                </div>
              </div>
            </form>
          </div><!-- End Contact Form -->
        </div>
      </div>
    </section><!-- /Contact Section -->
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

// Configurazione della pagina
definePageMeta({
  layout: 'maundy'
});

// Newsletter state
const newsletterEmail = ref('');
const newsletterLoading = ref(false);
const newsletterError = ref('');
const newsletterSuccess = ref('');
const newsletterSending = ref(false);

// Handle newsletter subscription
const handleNewsletterSubmit = async () => {
  if (!newsletterEmail.value) return;
  
  newsletterLoading.value = true;
  newsletterSending.value = true;
  newsletterError.value = '';
  newsletterSuccess.value = '';
  
  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBase;
    
    // Prima controlla se l'email esiste già usando il filtro contains
    try {
      const checkResponse = await axios.get(`${apiBase}/api/public/newsletter-subscribers`, {
        params: {
          'email.contains': newsletterEmail.value
        }
      });
      
      // Se la risposta contiene dati, l'email esiste già
      if (checkResponse.data && checkResponse.data.length > 0) {
        // Verifica se c'è una corrispondenza esatta
        const exactMatch = checkResponse.data.find((subscriber: any) => 
          subscriber.email === newsletterEmail.value
        );
        
        if (exactMatch) {
          newsletterSending.value = false;
          newsletterError.value = 'This email is already subscribed to our newsletter.';
          
          setTimeout(() => {
            newsletterError.value = '';
          }, 5000);
          
          return; // Esce senza registrare
        }
      }
    } catch (checkError: any) {
      // Se c'è un errore nel controllo, continua comunque con la registrazione
      console.log('Check error (proceeding anyway):', checkError);
    }
    
    // L'email non esiste, procedi con la registrazione
    const payload = {
      email: newsletterEmail.value,
      isSubscribed: true
    };
    
    await axios.post(`${apiBase}/api/public/newsletter-subscribers`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Mostra messaggio di invio completato per 1 secondo
    newsletterSending.value = false;
    newsletterSuccess.value = 'Subscription sent successfully!';
    
    // Dopo 1.5 secondi mostra il messaggio finale
    setTimeout(() => {
      newsletterSuccess.value = 'Your subscription request has been sent. Thank you!';
      newsletterEmail.value = ''; // Reset form
      
      // Hide success message after altri 4 secondi
      setTimeout(() => {
        newsletterSuccess.value = '';
      }, 4000);
    }, 1500);
    
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    
    newsletterSending.value = false;
    
    if (error.response?.status === 409) {
      // Email già presente - non registrare
      newsletterError.value = 'This email is already subscribed to our newsletter.';
    } else if (error.response?.data?.message) {
      newsletterError.value = error.response.data.message;
    } else {
      newsletterError.value = 'An error occurred. Please try again later.';
    }
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      newsletterError.value = '';
    }, 5000);
  } finally {
    newsletterLoading.value = false;
  }
};
</script>

<style scoped>
/* Stili personalizzati per i messaggi newsletter */
.newsletter-loading,
.newsletter-error,
.newsletter-success {
  margin-top: 15px;
  padding: 12px 20px;
  border-radius: 25px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.newsletter-loading {
  background: #24b7a4;
  color: #ffffff;
  border: 2px solid #24b7a4;
}

.newsletter-success {
  background: #24b7a4;
  color: #ffffff;
  border: 2px solid #24b7a4;
}

.newsletter-error {
  background: #dc3545;
  color: #ffffff;
  border: 2px solid #dc3545;
}

/* Aggiunge un effetto di pulsazione per il loading */
.newsletter-loading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 8px rgba(36, 183, 164, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(36, 183, 164, 0.6);
  }
  100% {
    box-shadow: 0 4px 8px rgba(36, 183, 164, 0.3);
  }
}
</style>