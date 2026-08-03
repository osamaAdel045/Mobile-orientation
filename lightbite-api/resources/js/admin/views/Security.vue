<template>
  <div>
    <LteAppContentHeader title="Security" subtitle="Admin accounts, roles, and access control">
      <button @click="showCreate = true" class="btn btn-sm btn-warning">Add Admin</button>
    </LteAppContentHeader>

    <!-- Admin Users -->
    <div class="card shadow-sm mb-4">
      <div class="card-header"><h5 class="card-title mb-0">Admin Users</h5></div>
      <div v-if="loadingA" class="card-body text-center text-body-secondary">Loading&hellip;</div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            <tr v-for="a in admins" :key="a.uuid">
              <td class="fw-medium small">{{ a.name }}</td>
              <td class="small text-body-secondary">{{ a.email }}</td>
              <td>
                <select :value="a.admin_role" @change="updateRole(a.uuid, ($event.target).value)" class="form-select form-select-sm" :class="roleColor(a.admin_role)" style="width:auto;">
                  <option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="support">Support</option><option value="read_only">Read Only</option>
                </select>
              </td>
              <td><span class="badge bg-success">{{ a.status }}</span></td>
              <td class="small text-body-secondary">{{ formatDate(a.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- IP Whitelist -->
    <div class="card shadow-sm">
      <div class="card-header"><h5 class="card-title mb-0">IP Whitelist</h5></div>
      <div class="card-body">
        <p class="small text-body-secondary mb-3">Restrict admin access to specific IP addresses. Leave empty to allow all.</p>
        <div class="d-flex gap-2 mb-3">
          <input v-model="newIp" placeholder="192.168.1.1" class="form-control form-control-sm" style="max-width:200px;" @keyup.enter="addIp"/>
          <button @click="addIp" class="btn btn-sm btn-outline-secondary">Add IP</button>
        </div>
        <div v-if="ips.length" class="d-flex flex-wrap gap-2 mb-3">
          <span v-for="(ip, i) in ips" :key="i" class="badge bg-info fs-6 d-inline-flex align-items-center gap-1">
            {{ ip }}<button @click="ips.splice(i,1)" class="btn-close btn-close-sm" style="font-size:0.5rem;"></button>
          </span>
        </div>
        <p v-else class="small text-body-secondary mb-3">No IP restrictions — admin panel accessible from anywhere.</p>
        <button @click="saveIps" class="btn btn-sm btn-warning">Save Whitelist</button>
        <span v-if="savedIps" class="text-success small ms-2">✓ Saved</span>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreate" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
      <div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Create Admin User</h5><button type="button" class="btn-close" @click="showCreate=false"></button></div><div class="modal-body"><div class="vstack gap-2"><input v-model="form.name" placeholder="Full Name" class="form-control form-control-sm" /><input v-model="form.email" placeholder="Email" type="email" class="form-control form-control-sm" /><input v-model="form.password" placeholder="Password (min 8 chars)" type="password" class="form-control form-control-sm" /><select v-model="form.admin_role" class="form-select form-select-sm"><option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="support">Support</option><option value="read_only">Read Only</option></select></div></div><div class="modal-footer"><button @click="showCreate=false" class="btn btn-secondary btn-sm">Cancel</button><button @click="createAdmin" :disabled="!form.name||!form.email||!form.password" class="btn btn-warning btn-sm">Create Admin</button></div></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const admins = ref([]); const loadingA = ref(true);
const ips = ref([]); const newIp = ref(''); const savedIps = ref(false);
const showCreate = ref(false);
const form = ref({ name: '', email: '', password: '', admin_role: 'admin' });

async function fetchAdmins() {
  try { const { data } = await api.get('/admin/admins'); admins.value = data.data.data || []; } catch(e) { console.error(e); }
  loadingA.value = false;
}
async function fetchIps() {
  try { const { data } = await api.get('/admin/security/ip-whitelist'); ips.value = data.data.ips || []; } catch(e) { console.error(e); }
}
async function updateRole(uuid, role) {
  await api.patch(`/admin/admins/${uuid}`, { admin_role: role });
}
async function createAdmin() {
  try {
    await api.post('/admin/admins', form.value);
    showCreate.value = false;
    form.value = { name: '', email: '', password: '', admin_role: 'admin' };
    await fetchAdmins();
  } catch(e) { alert(e.response?.data?.message || 'Failed to create admin'); }
}
function addIp() {
  const ip = newIp.value.trim();
  if (ip && !ips.value.includes(ip)) { ips.value.push(ip); newIp.value = ''; }
}
async function saveIps() {
  await api.put('/admin/security/ip-whitelist', { ips: ips.value });
  savedIps.value = true; setTimeout(() => savedIps.value = false, 3000);
}
function roleColor(r) {
  return { super_admin: 'text-purple', admin: 'text-warning', support: 'text-info', read_only: 'text-secondary' }[r] || '';
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ''; }

onMounted(() => { fetchAdmins(); fetchIps(); });
</script>
