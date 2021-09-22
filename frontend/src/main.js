// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VCalendar from 'v-calendar'
import '@/assets/css/tailwind.css'
import 'v-calendar/lib/v-calendar.min.css'
import Vuex from 'vuex'

// Use v-calendar, v-date-picker & v-popover components
Vue.use(VCalendar, {
  firstDayOfWeek: 2
})
Vue.use(Vuex)
Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    travels: [],
    notifiers: [],
    bookers: []
  }
})

/* eslint-disable no-new */
window.vue = new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  store
})
