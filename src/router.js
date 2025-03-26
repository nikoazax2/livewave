import { createRouter, createWebHistory } from 'vue-router';
import WavesView from './views/WavesView.vue';
import ChatView from './views/ChatView.vue';
import Blog from './views/Blog.vue';

const routes = [
    { path: '/', component: WavesView, name: 'waves' },
    { path: '/chat/:id', component: ChatView },
    { path: '/blog/:id', component: Blog },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
