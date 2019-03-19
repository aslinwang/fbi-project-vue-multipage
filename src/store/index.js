import * as getters from './getters'

import Vue from 'vue'
import Vuex from 'vuex'
import city from './modules/city'
import post from './modules/post'
import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
	strict: true,
	modules: {
		post,
		user,
		city
	}
})