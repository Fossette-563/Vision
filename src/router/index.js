import Vue from "vue";
import VueRouter from "vue-router";
import SellerPage from '@/views/SellerPage'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/screen'
  },
  {
    path: '/sellerpage',
    component: SellerPage
  },
  {
    path: '/trendpage',
    component: () => import('@/views/TrendPage')
  },
  {
    path: '/mappage',
    component: () => import('@/views/MapPage')
  },
  {
    path: '/rankpage',
    component: () => import('@/views/RankPage')
  },
  {
    path: '/hotpage',
    component: () => import('@/views/HotPage')
  },
  {
    path: '/stockpage',
    component: () => import('@/views/StockPage')
  },
  {
    path: '/screen',
    component: () => import('@/views/ScreenPage')
  },
];

const router = new VueRouter({
  routes,
});

export default router;
