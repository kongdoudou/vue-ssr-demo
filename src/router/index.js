import Vue from 'vue'
import Router from 'vue-router'
const HelloWorld = () => import('../components/HelloWorld/App.vue');

Vue.use(Router);

export default new Router({
  mode:"history",
  routes:[
    {
      path:"/",
      component:HelloWorld,
      name:"HelloWorld"
    }
  ]
})
