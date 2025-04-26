<!-- app/pages/admin/users/listUsers.vue -->
<template>
  <div>
    <div class="card shadow">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Gestione Utenti</h4>
        
        <!-- Debug badge -->
        <span v-if="isDebugMode" class="badge bg-warning text-dark">
          DEBUG MODE
        </span>
      </div>
      
      <div class="card-body">
        <!-- Debug info -->
        <div v-if="isDebugMode" class="alert alert-info mb-3">
          <div class="d-flex align-items-center mb-2">
            <i class="bi bi-info-circle me-2 fs-5"></i>
            <strong>Debug Info</strong>
          </div>
          <p class="mb-1">
            <small>Modalità debug attiva. Il token di autenticazione e i dettagli tecnici saranno visibili.</small>
          </p>
          <p class="mb-1">
            <small><strong>Token JWT:</strong> {{ authStore.getDisplayToken }}</small>
          </p>
          <p class="mb-0">
            <small><strong>Ruoli:</strong> {{ authStore.user?.authorities?.join(', ') }}</small>
          </p>
        </div>
        
        <!-- Tabella di gestione utenti -->
        <div class="user-table-container">
          <!-- Pulsanti di azione -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Elenco Utenti</h5>
            
            <button 
              class="btn btn-success" 
              @click="addNewUser"
            >
              <i class="bi bi-plus-circle me-1"></i> Aggiungi Utente
            </button>
          </div>
          
          <!-- Messaggio di caricamento -->
          <div v-if="loading" class="alert alert-info">
            <div class="d-flex align-items-center">
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span>Caricamento utenti in corso...</span>
            </div>
          </div>
          
          <!-- Messaggio di errore -->
          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i> {{ error }}
          </div>
          
          <!-- Nessun utente trovato -->
          <div v-if="!loading && !error && users.length === 0" class="alert alert-warning">
            <i class="bi bi-info-circle me-2"></i> Nessun utente trovato
          </div>
          
          <!-- Form per nuovo utente -->
          <div v-if="newUser" class="card mb-3 border-info">
            <div class="card-header bg-info text-white">
              Aggiungi Nuovo Utente
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="newUserLogin" class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="newUserLogin" 
                    v-model="newUser.login" 
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label for="newUserEmail" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="newUserEmail" 
                    v-model="newUser.email" 
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label for="newUserFirstName" class="form-label">Nome</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="newUserFirstName" 
                    v-model="newUser.firstName"
                  />
                </div>
                <div class="col-md-6">
                  <label for="newUserLastName" class="form-label">Cognome</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="newUserLastName" 
                    v-model="newUser.lastName"
                  />
                </div>
                <div class="col-md-6">
                  <label for="newUserPassword" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="newUserPassword" 
                    v-model="newUser.password"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label for="newUserLang" class="form-label">Lingua</label>
                  <select 
                    class="form-select" 
                    id="newUserLang" 
                    v-model="newUser.langKey"
                  >
                    <option value="en">English</option>
                    <option value="it">Italiano</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <div class="form-check form-switch mt-4">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="newUserActivated" 
                      v-model="newUser.activated"
                    />
                    <label class="form-check-label" for="newUserActivated">
                      Account Attivo
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ruoli</label>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="roleUser" 
                      value="ROLE_USER" 
                      v-model="newUser.authorities"
                    />
                    <label class="form-check-label" for="roleUser">
                      Utente
                    </label>
                  </div>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="roleAdmin" 
                      value="ROLE_ADMIN" 
                      v-model="newUser.authorities"
                    />
                    <label class="form-check-label" for="roleAdmin">
                      Amministratore
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="mt-3 d-flex justify-content-end">
                <button 
                  type="button" 
                  class="btn btn-secondary me-2" 
                  @click="cancelNewUser"
                >
                  Annulla
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  @click="saveNewUser"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
          
          <!-- Tabella utenti -->
          <div v-if="!loading && users.length > 0" class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-primary">
                <tr>
                  <th>Username</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Lingua</th>
                  <th>Stato</th>
                  <th>Ruoli</th>
                  <th class="text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(user, index) in users" :key="user.id">
                  <!-- Riga in modalità visualizzazione -->
                  <tr v-if="editingIndex !== index" :class="{ 'table-secondary': user.login === 'admin' }">
                    <td>{{ user.login }}</td>
                    <td>{{ user.firstName }} {{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.langKey === 'it' ? 'Italiano' : 'English' }}</td>
                    <td>
                      <span 
                        class="badge"
                        :class="user.activated ? 'bg-success' : 'bg-danger'"
                      >{{ user.activated ? 'Attivo' : 'Inattivo' }}</span>
                    </td>
                    <td>
                      <span v-for="(role, i) in user.authorities" :key="i" class="badge bg-info me-1">
                        {{ role.replace('ROLE_', '') }}
                      </span>
                    </td>
                    <td class="text-center">
                      <div class="btn-group btn-group-sm">
                        <button 
                          class="btn btn-primary"
                          @click="startEdit(index)"
                          :disabled="user.login === 'admin'"
                          title="Edit"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-danger"
                          @click="deleteUser(user)"
                          :disabled="user.login === 'admin'"
                          title="Delete"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Riga in modalità editing -->
                  <tr v-else class="table-info">
                    <td>{{ editedUser.login }}</td>
                    <td>
                      <div class="row g-1">
                        <div class="col">
                          <input v-model="editedUser.firstName" class="form-control form-control-sm" type="text" />
                        </div>
                        <div class="col">
                          <input v-model="editedUser.lastName" class="form-control form-control-sm" type="text" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <input v-model="editedUser.email" class="form-control form-control-sm" type="email" />
                    </td>
                    <td>
                      <select v-model="editedUser.langKey" class="form-select form-select-sm">
                        <option value="en">English</option>
                        <option value="it">Italiano</option>
                      </select>
                    </td>
                    <td>
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="userActivated" v-model="editedUser.activated">
                      </div>
                    </td>
                    <td>
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="editRoleUser" 
                          value="ROLE_USER" 
                          v-model="editedUser.authorities"
                        />
                        <label class="form-check-label" for="editRoleUser">User</label>
                      </div>
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="editRoleAdmin" 
                          value="ROLE_ADMIN" 
                          v-model="editedUser.authorities"
                        />
                        <label class="form-check-label" for="editRoleAdmin">Admin</label>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-success" @click="saveEdit" title="Save">
                          <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="btn btn-secondary" @click="cancelEdit" title="Cancel">
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Conferma Eliminazione Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmModalLabel">Conferma Eliminazione</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Sei sicuro di voler eliminare l'utente "{{ userToDelete?.login }}"?</p>
            <p class="text-danger"><strong>Questa azione è irreversibile.</strong></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="confirmDelete"
              :disabled="deleteLoading"
            >
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useUsers } from '~/composables/useUsers';
import { useI18n } from '~/composables/useI18n';
import { useAuthStore } from '~/stores/auth';

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard',
  middleware: ['admin', 'i18n']
});

// Types
interface User {
  id?: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  activated: boolean;
  langKey: string;
  authorities: string[];
  password?: string;
  createdBy?: string;
  createdDate?: string | null;
  lastModifiedBy?: string;
  lastModifiedDate?: string | null;
}

// Composables
const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser: apiDeleteUser } = useUsers();
const { t, currentLanguage } = useI18n();
const authStore = useAuthStore();

// Refs
const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
const editingIndex = ref<number | null>(null);
const editedUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const deleteLoading = ref(false);
const newUser = ref<User | null>(null);
const deleteModal = ref<HTMLElement | null>(null);
let bsDeleteModal: any = null; // Bootstrap modal instance

// Inizializzazione
onMounted(async () => {
  if (isDebugMode.value) {
    console.log('[ListUsers] Page mounted');
    console.log('[ListUsers] Current auth state:', {
      isAdmin: authStore.isAdmin,
      user: authStore.user?.login
    });
  }
  
  await loadUsers();
  
  // Inizializza il modal di bootstrap dopo un breve ritardo
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const modalElement = document.getElementById('deleteConfirmModal');
      if (modalElement) {
        bsDeleteModal = new window.bootstrap.Modal(modalElement);
        if (isDebugMode.value) {
          console.log('[ListUsers] Bootstrap modal initialized');
        }
      } else {
        console.warn('[ListUsers] Modal element not found');
      }
    } else {
      console.warn('[ListUsers] Bootstrap not available');
    }
  }, 500);
});

// Metodi
const loadUsers = async () => {
  try {
    await fetchUsers();
    
    if (isDebugMode.value) {
      console.log('[ListUsers] Users loaded:', users.value);
    }
  } catch (err) {
    console.error('[ListUsers] Error loading users:', err);
  }
};

const startEdit = (index: number) => {
  if (users.value[index]) {
    // Crea una copia profonda dell'utente per l'editing
    editedUser.value = JSON.parse(JSON.stringify(users.value[index]));
    editingIndex.value = index;
    
    if (isDebugMode.value) {
      console.log('[ListUsers] Start editing user:', editedUser.value);
    }
  }
};

const saveEdit = async () => {
  if (!editedUser.value) return;
  
  try {
    if (isDebugMode.value) {
      console.log('[ListUsers] Saving edited user:', editedUser.value);
    }
    
    await updateUser(editedUser.value.login, editedUser.value);
    
    // Resetta lo stato di editing
    editingIndex.value = null;
    editedUser.value = null;
    
    // Ricarica gli utenti
    await loadUsers();
  } catch (err) {
    console.error('[ListUsers] Error saving user:', err);
  }
};

const cancelEdit = () => {
  editingIndex.value = null;
  editedUser.value = null;
};

const deleteUser = (user: User) => {
  userToDelete.value = user;
  
  if (isDebugMode.value) {
    console.log('[ListUsers] Delete request for user:', user.login);
  }
  
  // Mostra il modal di conferma
  if (bsDeleteModal) {
    bsDeleteModal.show();
  } else {
    // Fallback se il modal non è inizializzato
    if (confirm(`Sei sicuro di voler eliminare l'utente "${user.login}"?`)) {
      confirmDelete();
    }
  }
};

const confirmDelete = async () => {
  if (!userToDelete.value) return;
  
  deleteLoading.value = true;
  
  try {
    if (isDebugMode.value) {
      console.log('[ListUsers] Confirming delete user:', userToDelete.value.login);
    }
    
    await apiDeleteUser(userToDelete.value.login);
    
    // Chiudi il modal
    if (bsDeleteModal) {
      bsDeleteModal.hide();
    }
    
    // Ricarica gli utenti
    await loadUsers();
  } catch (err) {
    console.error('[ListUsers] Error deleting user:', err);
  } finally {
    deleteLoading.value = false;
    userToDelete.value = null;
  }
};

const addNewUser = () => {
  // Inizializza un nuovo oggetto utente
  newUser.value = {
    login: '',
    firstName: '',
    lastName: '',
    email: '',
    activated: true,
    langKey: currentLanguage.value,
    authorities: ['ROLE_USER'],
    password: '',
  };
  
  if (isDebugMode.value) {
    console.log('[ListUsers] New user form initialized');
  }
};

const saveNewUser = async () => {
  if (!newUser.value) return;
  
  // Validazione base
  if (!newUser.value.login || !newUser.value.email || !newUser.value.password) {
    alert('Per favore compila tutti i campi obbligatori');
    return;
  }
  
  try {
    if (isDebugMode.value) {
      console.log('[ListUsers] Saving new user:', newUser.value);
    }
    
    await createUser(newUser.value);
    newUser.value = null;
    
    // Ricarica gli utenti
    await loadUsers();
  } catch (err) {
    console.error('[ListUsers] Error creating user:', err);
  }
};

const cancelNewUser = () => {
  newUser.value = null;
};
</script>

<style scoped>
.user-table-container {
  overflow-x: auto;
}

.table .table-info {
  --bs-table-bg: rgba(13, 202, 240, 0.2);
}
</style>

<!-- Version: 1.0.1 -->