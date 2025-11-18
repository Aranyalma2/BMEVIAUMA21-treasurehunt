<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsersStore } from '@/stores/users';

const usersStore = useUsersStore();
const editingUserId = ref<number | null>(null);

const handleRoleChange = async (userId: number, newRole: string) => {
  await usersStore.updateUserRole(userId, newRole);
  editingUserId.value = null;
};

const handleDelete = async (id: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    await usersStore.deleteUser(id);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatRole = (role: string) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const normalizeRole = (role: string) => {
  return role?.toUpperCase() || '';
};

onMounted(() => {
  usersStore.fetchUsers();
  usersStore.fetchRoles();
});
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-semibold text-white">Users</h1>
    </div>

    <div v-if="usersStore.error" class="p-3 bg-red-900 border border-red-700 text-red-200 text-sm">
      {{ usersStore.error }}
    </div>

    <div v-if="usersStore.isLoading" class="text-center py-8">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>

    <div v-else-if="usersStore.users.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No users</p>
    </div>

    <div v-else class="overflow-x-auto border border-gray-800">
      <table class="w-full text-sm">
        <thead class="bg-gray-800 border-b border-gray-700">
          <tr>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Name</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Username</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Role</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Created</th>
            <th class="px-4 py-2 text-center font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="user in usersStore.users" :key="user.id" class="hover:bg-gray-800">
            <td class="px-4 py-3 text-white font-medium">{{ user.name }}</td>
            <td class="px-4 py-3 text-gray-400">{{ user.username }}</td>
            <td class="px-4 py-3">
              <div v-if="editingUserId === user.id" class="flex gap-1">
                <select
                  :value="normalizeRole(user.role)"
                  class="px-2 py-1 border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                  @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="roleName in usersStore.roles"
                    :key="roleName"
                    :value="roleName"
                    class="bg-gray-800 text-white"
                  >
                    {{ formatRole(roleName) }}
                  </option>
                </select>
                <button
                  class="px-2 py-1 text-xs border border-gray-700 text-gray-300 hover:bg-gray-800"
                  @click="editingUserId = null"
                >
                  Cancel
                </button>
              </div>
              <div v-else class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium border',
                    normalizeRole(user.role) === 'ADMIN'
                      ? 'bg-purple-900 border-purple-700 text-purple-200'
                      : 'bg-blue-900 border-blue-700 text-blue-200',
                  ]"
                >
                  {{ formatRole(user.role) }}
                </span>
                <button class="text-xs text-gray-400 hover:text-gray-300 underline" @click="editingUserId = user.id">
                  edit
                </button>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-400">{{ formatDate(user.createdAt) }}</td>
            <td class="px-4 py-3 text-center">
              <button
                class="px-2 py-1 text-xs border border-gray-700 text-gray-300 hover:bg-red-900 hover:border-red-700"
                title="Delete"
                @click="handleDelete(user.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>
