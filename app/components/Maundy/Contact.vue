// components/Contact.vue
<template>
  <section id="contact" class="contact section transparent-background">
    <div class="container section-title" data-aos="fade-up">
      <h2>Contact</h2>
      <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
    </div>

    <div class="container" data-aos="fade" data-aos-delay="100">
      <div class="row gy-4">
        <div class="col-lg-4">
          <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="200">
            <i class="bi bi-geo-alt flex-shrink-0"></i>
            <div>
              <h3>Address</h3>
              <p>A108 Adam Street, New York, NY 535022</p>
            </div>
          </div>

          <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="300">
            <i class="bi bi-telephone flex-shrink-0"></i>
            <div>
              <h3>Call Us</h3>
              <p>+1 5589 55488 55</p>
            </div>
          </div>

          <div class="info-item d-flex" data-aos="fade-up" data-aos-delay="400">
            <i class="bi bi-envelope flex-shrink-0"></i>
            <div>
              <h3>Email Us</h3>
              <p>info@example.com</p>
            </div>
          </div>
        </div>

        <CallToAction />
        <!-- CallToAction --
        <div class="col-lg-8">
          <form @submit.prevent="handleSubmit" class="php-email-form" data-aos="fade-up" data-aos-delay="200">
            <div class="row gy-4">
              <div class="col-md-6">
                <input 
                  type="text" 
                  v-model="callToActionData.name" 
                  class="form-control" 
                  placeholder="Your Name" 
                  required 
                />
              </div>
              <div class="col-md-6">
                <input 
                  type="email" 
                  v-model="callToActionData.email" 
                  class="form-control" 
                  placeholder="Your Email" 
                  required 
                />
              </div>
              <div class="col-md-12">
                <textarea 
                  class="form-control" 
                  v-model="callToActionData.message" 
                  rows="6" 
                  placeholder="Message" 
                  required
                ></textarea>
              </div>
              <div class="col-md-12 text-center">
                <div 
                  class="loading"
                  :class="{ active: loading }"
                >
                  Loading
                </div>
                <div 
                  class="error-message"
                  :class="{ active: error }"
                >
                  {{ error }}
                </div>
                <div 
                  class="sent-message"
                  :class="{ active: response }"
                >
                  Your message has been sent. Thank you!
                </div>
                <button type="submit">Send Message</button>
              </div>
            </div>
          </form>
        </div>
        -- Fine CallToAction -->
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

const { 
  callToActionData, 
  response, 
  error, 
  loading, 
  submitCallToAction 
} = useCallToAction()


const clearMessages = () => {
  response.value = null
  error.value = null
}

// Gestione temporizzata dei messaggi
let messageTimeout: NodeJS.Timeout | null = null

const handleSubmit = async () => {
  // Pulisce eventuali timeout precedenti
  if (messageTimeout) {
    clearTimeout(messageTimeout)
    messageTimeout = null
  }
  
  await submitCallToAction()
  
  // Se c'è una risposta o un errore, imposta il timeout
  if (response.value || error.value) {
    messageTimeout = setTimeout(() => {
      clearMessages()
    }, 3000) // 3 secondi
  }
}

// Pulizia al dismount del componente
onUnmounted(() => {
  if (messageTimeout) {
    clearTimeout(messageTimeout)
  }
})

</script>

<style>
/* Manteniamo esattamente gli stili originali */
.contact .info-item {
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.contact .info-item i {
  font-size: 20px;
  color: var(--primary-color);
  float: left;
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  transition: all 0.3s ease-in-out;
  background: rgba(var(--primary-color-rgb), 0.1);
}

.contact .info-item h4 {
  padding: 0 0 0 60px;
  font-size: 22px;
  font-weight: 600;
}

.contact .info-item p {
  padding: 0 0 0 60px;
  margin-bottom: 0;
  font-size: 14px;
}

.contact .php-email-form {
  width: 100%;
  background: var(--secondary-color);
  padding: 30px;
  border-radius: 0;
}

.contact .php-email-form .form-group {
  padding-bottom: 8px;
}

/* Modifica solo questa parte nel blocco degli stili CSS, il resto rimane identico */

.contact .php-email-form input[type=text],
.contact .php-email-form input[type=email],
.contact .php-email-form textarea {
  border-radius: 3px;
  box-shadow: none;
  font-size: 14px;
  background: rgba(var(--primary-color-rgb), 0.04);
  border: 1px solid #949ea8;  /* Bordo grigio */
  transition: border-color 0.15s ease-in-out;
  width: 100%;
  padding: 12px 15px;
}

.contact .php-email-form input[type=text]:focus,
.contact .php-email-form input[type=email]:focus,
.contact .php-email-form textarea:focus {
  border-color: #34c38f;  /* Bordo verde al focus */
  outline: 0;
}

.contact .php-email-form button[type=submit] {
  background: var(--primary-color);
  border: 0;
  padding: 10px 30px;
  color: var(--secondary-color);
  transition: 0.4s;
  border-radius: 50px;
}

.contact .php-email-form button[type=submit]:hover {
  background: rgba(var(--primary-color-rgb), 0.8);
}

.contact .php-email-form .loading {
  display: none;
  background: var(--secondary-color);
  text-align: center;
  padding: 15px;
}

.contact .php-email-form .loading.active {
  display: block;
}

.contact .php-email-form .error-message {
  display: none;
  color: var(--secondary-color);
  background: #df1529;
  text-align: center;
  padding: 15px;
  font-weight: 600;
}

.contact .php-email-form .error-message.active {
  display: block;
}

.contact .php-email-form .sent-message {
  display: none;
  color: var(--secondary-color);
  background: var(--primary-color);
  text-align: center;
  padding: 15px;
  font-weight: 600;
}

.contact .php-email-form .sent-message.active {
  display: block;
}

@keyframes animate-loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
/* Sostituisci solo la parte del bottone nel CSS del Contact.vue, mantenendo tutto il resto invariato */

.contact .php-email-form button[type=submit] {
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

.contact .php-email-form button[type=submit]:hover {
  background-color: #2ca97d;
}

.contact .php-email-form button[type=submit]:disabled {
  background-color: #34c38f;
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
