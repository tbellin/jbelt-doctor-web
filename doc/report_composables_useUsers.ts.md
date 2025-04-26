## composables/useUsers.ts

```typescript
// composables/useUsers.ts
import { useUsersStore } from '~/stores/users';

export function useUsers() {
  const usersStore = useUsersStore();

  const fetchUsers = async (page: number = 0, size: number = 20) => {
    return await usersStore.fetchUsers(page, size);
  };

  const fetchUser = async (login: string) => {
    return await usersStore.fetchUser(login);
  };

  const createUser = async (userData: any) => {
    return await usersStore.createUser(userData);
  };

  const updateUser = async (login: string, userData: any) => {
    return await usersStore.updateUser(login, userData);
  };

  const deleteUser = async (login: string) => {
    return await usersStore.deleteUser(login);
  };

  return {
    users: computed(() => usersStore.getUsers),
    currentUser: computed(() => usersStore.getCurrentUser),
    loading: computed(() => usersStore.loading),
    error: computed(() => usersStore.error),
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser
  };
}
```

This composable provides access to the users store.
