import { createRouter, createWebHistory } from 'vue-router';
import WavesView from './views/WavesView.vue';
import ChatView from './views/ChatView.vue';

const routes = [
    { path: '/', component: WavesView, name: 'waves' },
    { path: '/chat/:id', component: ChatView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
