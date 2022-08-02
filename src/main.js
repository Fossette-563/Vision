import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 引入全局样式文件
import './assets/css/glob.css'
// 引入字体文件
import './assets/font/iconfont.css'
import axios from 'axios'
import SocketService from '@/utils/socket_service'
SocketService.Instance.connect()
// 3, 请求基地址配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 4, 将axios挂载到Vue的原型对象上（在其他组件可以通过this.$http请求）
Vue.prototype.$http = axios
// 2, 将全局的echarts对象挂载到vue原型对象上(在其他组件使用可通过this.echarts)
Vue.prototype.$echarts = window.echarts
// 将 SocketService 实例对象挂载到 Vue 的原型对象上
Vue.prototype.$socket = SocketService.Instance
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
