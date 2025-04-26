<!-- app/components/Admin/UserTable.vue -->
<template>
    <div class="user-table-container">
      <!-- Intestazione con pulsanti di azione -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>{{ t('manage_users') }}</h3>
        
        <div class="d-flex">
          <button 
            v-if="isDebugMode" 
            class="btn btn-warning btn-sm me-2" 
            @click="toggleDebugInfo"
          >
            <i class="bi bi-bug"></i> {{ showDebugInfo ? 'Nascondi Debug' : 'Mostra Debug' }}
          </button>
          
          <button 
            class="btn btn-success" 
            @click="addNewUser"
          >
            <i class="bi bi-plus-circle me-1"></i> {{ t('add_user') }}
          </button>
        </div>
      </div>
      
      <!-- Debug panel (visibile solo in modalità debug) -->
      <div v-if="isDebugMode && showDebugInfo" class="debug-panel mb-4 p-3 border rounded bg-light">
        <h5 class="mb-3">📊 Debug Informazioni</h5>
        <div class="mb-2">
          <strong>Stato corrente:</strong>
          <ul class="mb-0 ps-3">
            <li>Total users: {{ users.length }}</li>
            <li>Loading: {{ loading }}</li>
            <li>Errore: {{ error || 'Nessuno' }}</li>
            <li>Modo editing: {{ editingIndex !== null ? `Utente #${editingIndex}` : 'Nessuno' }}</li>
          </ul>
        </div>
      </div>
      
      <!-- Messaggio di caricamento -->
      <div v-if="loading" class="alert alert-info">
        <div class="d-flex align-items-center">
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>{{ t('loading') }}</span>
        </div>
      </div>
      
      <!-- Messaggio di errore -->
      <div v-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i> {{ error }}
      </div>
      
      <!-- Nessun utente trovato -->
      <div v-if="!loading && !error && users.length === 0" class="alert alert-warning">
        <i class="bi bi-info-circle me-2"></i> {{ t('no_users_found') }}
      </div>
      
      <!-- Tabella utenti -->
      <div v-if="!loading && users.length > 0" class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-primary">
            <tr>
              <th>{{ t('login') }}</th>
              <th>{{ t('full_name') }}</th>
              <th>{{ t('email') }}</th>
              <th>{{ t('language') }}</th>
              <th>{{ t('status') }}</th>
              <th>{{ t('roles') }}</th>
              <th class="text-center">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Riga aggiunta utente -->
            <tr v-if="newUser" :class="{ 'table-info': true }">
              <td>
                <input v-model="newUser.login" class="form-control form-control-sm" type="text" :placeholder="t('login')" />
              </td>
              <td>
                <div class="row g-1">
                  <div class="col">
                    <input v-model="newUser.firstName" class="form-control form-control-sm" type="text" :placeholder="t('first_name')" />
                  </div>
                  <div class="col">
                    <input v-model="newUser.lastName" class="form-control form-control-sm" type="text" :placeholder="t('last_name')" />
                  </div>
                </div>
              </td>
              <td>
                <input v-model="newUser.email" class="form-control form-control-sm" type="email" :placeholder="t('email')" />
              </td>
              <td>
                <select v-model="newUser.langKey" class="form-select form-select-sm">
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                </select>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" role="switch" id="newUserActivated" v-model="newUser.activated">
                  <label class="form-check-label" for="newUserActivated">{{ newUser.activated ? t('active') : t('inactive') }}</label>
                </div>
              </td>
              <td>
                <select v-model="newUser.authorities" class="form-select form-select-sm" multiple size="2">
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-success" @click="saveNewUser" title="Save">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button class="btn btn-secondary" @click="cancelNewUser" title="Cancel">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Righe degli utenti esistenti -->
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
                  >{{ user.activated ? t('active') : t('inactive') }}</span>
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
                <td>
                  <input v-model="editedUser.login" class="form-control form-control-sm" type="text" :placeholder="t('login')" :disabled="true" />
                </td>
                <td>
                  <div class="row g-1">
                    <div class="col">
                      <input v-model="editedUser.firstName" class="form-control form-control-sm" type="text" :placeholder="t('first_name')" />
                    </div>
                    <div class="col">
                      <input v-model="editedUser.lastName" class="form-control form-control-sm" type="text" :placeholder="t('last_name')" />
                    </div>
                  </div>
                </td>
                <td>
                  <input v-model="editedUser.email" class="form-control form-control-sm" type="email" :placeholder="t('email')" />
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
                    <label class="form-check-label" for="userActivated">{{ editedUser.activated ? t('active') : t('inactive') }}</label>
                  </div>
                </td>
                <td>
                  <select v-model="editedUser.authorities" class="form-select form-select-sm" multiple size="2">
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_ADMIN">Admin</option>
                  </select>
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
      
      <!-- Paginazione (da implementare) -->
      <div v-if="users.length > 0" class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted">
          {{ t('showing') }} {{ users.length }} {{ t('of') }} {{ users.length }} {{ t('users') }}
        </div>
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item disabled">
              <a class="page-link" href="#" tabindex="-1" aria-disabled="true">{{ t('previous') }}</a>
            </li>
            <li class="page-item active"><a class="page-link" href="#">1</a></li>
            <li class="page-item disabled">
              <a class="page-link" href="#">{{ t('next') }}</a>
            </li>
          </ul>
        </nav>
      </div>
      
      <!-- Conferma Eliminazione Modal -->
      <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true" ref="deleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="deleteConfirmModalLabel">{{ t('confirm_delete') }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>{{ t('delete_user_confirmation', { user: userToDelete?.login }) }}</p>
              <p class="text-danger"><strong>{{ t('action_irreversible') }}</strong></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('cancel') }}</button>
              <button 
                type="button" 
                class="btn btn-danger" 
                @click="confirmDelete"
                :disabled="deleteLoading"
              >
                <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ t('delete') }}
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
  import { Modal } from 'bootstrap';
  
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
  
  // Refs
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const showDebugInfo = ref(false);
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
      console.log('[UserTable] Component mounted');
    }
    
    await loadUsers();
    
    // Inizializza il modal di bootstrap
    if (deleteModal.value) {
      bsDeleteModal = new Modal(deleteModal.value);
    }
  });
  
  // Metodi
  const loadUsers = async () => {
    try {
      await fetchUsers();
      
      if (isDebugMode.value) {
        console.log('[UserTable] Users loaded:', users.value);
      }
    } catch (err) {
      console.error('[UserTable] Error loading users:', err);
    }
  };
  
  const toggleDebugInfo = () => {
    showDebugInfo.value = !showDebugInfo.value;
  };
  
  const startEdit = (index: number) => {
    if (users.value[index]) {
      // Crea una copia profonda dell'utente per l'editing
      editedUser.value = JSON.parse(JSON.stringify(users.value[index]));
      editingIndex.value = index;
      
      if (isDebugMode.value) {
        console.log('[UserTable] Start editing user:', editedUser.value);
      }
    }
  };
  
  const saveEdit = async () => {
    if (!editedUser.value) return;
    
    try {
      if (isDebugMode.value) {
        console.log('[UserTable] Saving edited user:', editedUser.value);
      }
      
      await updateUser(editedUser.value.login, editedUser.value);
      
      // Resetta lo stato di editing
      editingIndex.value = null;
      editedUser.value = null;
      
      // Ricarica gli utenti
      await loadUsers();
    } catch (err) {
      console.error('[UserTable] Error saving user:', err);
    }
  };
  
  const cancelEdit = () => {
    editingIndex.value = null;
    editedUser.value = null;
  };
  
  const deleteUser = (user: User) => {
    userToDelete.value = user;
    
    if (isDebugMode.value) {
      console.log('[UserTable] Delete request for user:', user.login);
    }
    
    // Mostra il modal di conferma
    if (bsDeleteModal) {
      bsDeleteModal.show();
    }
  };
  
  const confirmDelete = async () => {
    if (!userToDelete.value) return;
    
    deleteLoading.value = true;
    
    try {
      if (isDebugMode.value) {
        console.log('[UserTable] Confirming delete user:', userToDelete.value.login);
      }
      
      await apiDeleteUser(userToDelete.value.login);
      
      // Chiudi il modal
      if (bsDeleteModal) {
        bsDeleteModal.hide();
      }
      
      // Ricarica gli utenti
      await loadUsers();
    } catch (err) {
      console.error('[UserTable] Error deleting user:', err);
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
      console.log('[UserTable] New user form initialized');
    }
  };
  
  const saveNewUser = async () => {
    if (!newUser.value) return;
    
    // Validazione base
    if (!newUser.value.login || !newUser.value.email || !newUser.value.password) {
      alert(t('fill_required_fields'));
      return;
    }
    
    try {
      if (isDebugMode.value) {
        console.log('[UserTable] Saving new user:', newUser.value);
      }
      
      await createUser(newUser.value);
      newUser.value = null;
      
      // Ricarica gli utenti
      await loadUsers();
    } catch (err) {
      console.error('[UserTable] Error creating user:', err);
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
  
  .debug-panel {
    font-size: 0.9rem;
    text-align: left;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  /* Stile per le righe in editing */
  .table .table-info {
    --bs-table-bg: rgba(13, 202, 240, 0.2);
  }
  
  /* Assicura che i select multipli abbiano un'altezza ragionevole */
  select[multiple] {
    max-height: 60px;
  }
  </style>
  
  <!-- Version: 1.0.0 -->