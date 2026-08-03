import { createApp } from 'vue';
import { createPinia } from 'pinia';
import AdminLteVue from '@adminlte/vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(AdminLteVue);
app.use(createPinia());
app.use(router);
app.mount('#admin-app');
