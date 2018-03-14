import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        // {
        //   path: '/',
        //   name: 'landing-page',
        //   component: require('@/components/LandingPage').default
        // },
        {
            path: '/',
            name: 'index-view',
            component: require('@/components/IndexView').default,
            children: [
                {
                    path: '',
                    component: require('@/components/FavouritesView').default,
                    children: [
                        {
                            path: '/my-drives',
                            component: require('@/components/MyDrives/MyDrivesView').default
                        },
                        {
                            path: '/wallet',
                            component: require('@/components/MyDrives/Wallet').default
                        },
                        {
                            path: '/wallet-manager',
                            component: require('@/components/MyDrives/WalletManager').default
                        },
                        {
                            path: '/generate-wallet',
                            component: require('@/components/EncryptionKey.vue').default
                        }
                    ]
                }
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
