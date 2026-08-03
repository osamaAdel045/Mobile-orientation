<template>
  <div>
    <LteAppContentHeader title="Theme Manager" subtitle="Customize the mobile app appearance. Changes push to all devices.">
      <template #actions>
        <div class="d-flex gap-2">
          <button @click="save" :disabled="saving" class="btn btn-sm btn-warning">{{ saving ? 'Saving...' : 'Save & Push' }}</button>
          <button @click="reset" class="btn btn-sm btn-outline-secondary">Reset Defaults</button>
        </div>
      </template>
    </LteAppContentHeader>

    <div v-if="saved" class="alert alert-success small mb-3">Theme saved! Silent push notification sent to all mobile devices.</div>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading theme&hellip;</div>
    <div v-else class="row">
      <div class="col-lg-8">
        <div class="vstack gap-3">
          <div v-for="group in colorGroups" :key="group.key" class="card shadow-sm">
            <div class="card-header d-flex align-items-center gap-2">
              <span class="rounded-circle" :style="{ background: theme.colors[group.key]?.[Object.keys(theme.colors[group.key]||{})[Math.floor(Object.keys(theme.colors[group.key]||{}).length/2)]||'#ccc'] }" style="width:12px;height:12px;"></span>
              <h5 class="card-title mb-0 text-capitalize">{{ group.key }} Colors</h5>
            </div>
            <div class="card-body">
              <div class="row g-2">
                <div v-for="(color, token) in theme.colors[group.key]" :key="token" class="col-6 d-flex align-items-center gap-2">
                  <input type="color" :value="color" @input="updateColor(group.key, token, $event.target.value)" class="form-control-color" style="width:32px;height:32px;padding:0;border:0;" />
                  <span class="small text-body-secondary" style="width:40px;">{{ token }}</span>
                  <input :value="color" @input="updateColor(group.key, token, $event.target.value)" class="form-control form-control-sm font-monospace" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card shadow-sm">
          <div class="card-header"><h5 class="card-title mb-0">Live Preview</h5></div>
          <div class="card-body vstack gap-2">
            <div class="p-2 rounded text-white text-center small fw-medium" :style="{ background: theme.colors.primary?.[500] }">Primary Button</div>
            <div class="p-2 rounded border small fw-medium" :style="{ color: theme.colors.semantic?.success, borderColor: theme.colors.semantic?.success }">Success Message</div>
            <div class="p-2 rounded border small fw-medium" :style="{ color: theme.colors.semantic?.error, borderColor: theme.colors.semantic?.error }">Error Message</div>
            <div class="p-2 rounded border small fw-medium" :style="{ color: theme.colors.semantic?.info, borderColor: theme.colors.semantic?.info }">Info Message</div>
            <div class="d-flex flex-wrap gap-1 mt-2">
              <span v-for="s in ['pending','confirmed','preparing','ready','delivering','delivered','cancelled']" :key="s" class="badge text-capitalize" :style="{ background: theme.colors.status?.[s] || '#999' }">{{ s }}</span>
            </div>
            <div class="p-2 rounded small mt-2" :style="{ background: theme.colors.neutral?.[50] || '#f9fafb' }">
              <p class="fw-semibold mb-1" :style="{ color: theme.colors.neutral?.[900] || '#111' }">Sample Card</p>
              <p class="small mb-0" :style="{ color: theme.colors.neutral?.[500] || '#6b7280' }">This is how secondary text looks on neutral backgrounds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const theme = reactive({ colors: {} });
const colorGroups = [{ key: 'primary' }, { key: 'neutral' }, { key: 'semantic' }, { key: 'status' }];

onMounted(async () => {
  const { data } = await api.get('/admin/theme');
  Object.assign(theme, data.data);
  loading.value = false;
});

function updateColor(group, token, value) { theme.colors[group][token] = value; }

async function save() {
  saving.value = true; saved.value = false;
  await api.put('/admin/theme', { colors: theme.colors });
  saving.value = false; saved.value = true;
  setTimeout(() => saved.value = false, 3000);
}

async function reset() {
  await api.post('/admin/theme/reset');
  const { data } = await api.get('/admin/theme');
  Object.assign(theme, data.data);
}
</script>
