import { createRouter, createWebHistory } from 'vue-router';
import WavesView from './views/WavesView.vue';
import ChatView from './views/ChatView.vue';
import Blog from './views/Blog.vue';
import Blogs from './views/Blogs.vue';
import AppWavesChats from './views/AppWavesChats.vue';

const routes = [
    { path: '/', component: AppWavesChats, name: 'waves' },
    { path: '/chat/:id', component: AppWavesChats },
    { path: '/blog/:id', component: Blog, name: 'Blog' },
    { path: '/blogs', component: Blogs, name: 'Blogs' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
