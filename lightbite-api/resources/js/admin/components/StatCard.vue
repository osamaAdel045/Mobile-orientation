<template>
  <router-link v-if="to" :to="to" class="text-decoration-none d-block">
    <div class="card stat-card shadow-sm h-100 mb-0" :class="flashClass">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" :class="chipClass" style="width:46px;height:46px;">
          <i class="bi" :class="icon" style="font-size:1.35rem;"></i>
        </div>
        <div class="flex-grow-1 min-w-0">
          <p class="text-body-secondary small text-uppercase fw-medium mb-0 text-truncate">{{ title }}</p>
          <p class="fw-bold mb-0 stat-value" style="font-size:1.35rem;">{{ prefix }}{{ formatted }}{{ suffix }}</p>
          <small v-if="sub" class="text-body-tertiary text-truncate d-block">{{ sub }}</small>
        </div>
      </div>
    </div>
  </router-link>
  <div v-else class="card stat-card shadow-sm h-100 mb-0" :class="flashClass">
    <div class="card-body d-flex align-items-center gap-3 py-3">
      <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" :class="chipClass" style="width:46px;height:46px;">
        <i class="bi" :class="icon" style="font-size:1.35rem;"></i>
      </div>
      <div class="flex-grow-1 min-w-0">
        <p class="text-body-secondary small text-uppercase fw-medium mb-0 text-truncate">{{ title }}</p>
        <p class="fw-bold mb-0 stat-value" style="font-size:1.35rem;">{{ prefix }}{{ formatted }}{{ suffix }}</p>
        <small v-if="sub" class="text-body-tertiary text-truncate d-block">{{ sub }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  icon: { type: String, default: 'bi-circle' },
  color: { type: String, default: 'secondary' },
  to: { type: String, default: '' },
  sub: { type: String, default: '' },
  decimals: { type: Number, default: 0 },
});

const displayValue = ref(0);
let rafId = null;
let prevValue = null;
const flashClass = ref('');

const chipClass = computed(() => {
  // Keep the chip readable across light/dark themes.
  const map = {
    warning: 'bg-warning text-dark',
    info: 'bg-info text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    dark: 'bg-dark text-white',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
  };
  return map[props.color] || map.secondary;
});

const numericValue = computed(() => {
  const n = typeof props.value === 'number' ? props.value : parseFloat(props.value);
  return Number.isFinite(n) ? n : 0;
});

function animateTo(target) {
  const start = displayValue.value;
  const diff = target - start;
  if (Math.abs(diff) < 0.0001) { displayValue.value = target; return; }
  const duration = 450;
  const t0 = performance.now();
  if (rafId) cancelAnimationFrame(rafId);
  const step = (now) => {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    displayValue.value = start + diff * eased;
    if (p < 1) rafId = requestAnimationFrame(step);
    else displayValue.value = target;
  };
  rafId = requestAnimationFrame(step);
}

watch(numericValue, (newVal, oldVal) => {
  if (prevValue !== null && newVal !== prevValue) {
    flashClass.value = newVal > prevValue ? 'flash-green' : 'flash-amber';
    setTimeout(() => { flashClass.value = ''; }, 1200);
  }
  prevValue = newVal;
  animateTo(newVal);
});

onMounted(() => {
  prevValue = null;
  displayValue.value = 0;
  animateTo(numericValue.value);
});

const formatted = computed(() => {
  const opts = props.decimals > 0
    ? { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals }
    : { maximumFractionDigits: 0 };
  return displayValue.value.toLocaleString(undefined, opts);
});
</script>
