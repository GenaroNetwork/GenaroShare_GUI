<style scoped>
    .layout-favourites-enum {
        min-height: 520px;
        width: 200px;
        background: #fff;
        overflow: hidden;
        border-radius: 8px;
        flex-shrink: 0;
    }
    .layout-favourites-content {
        flex-grow: 1;
        margin-left: 20px;
        min-height: 520px;
        background: #fff;
        border-radius: 8px;
    }
    .colcontainer {
        display: flex;
        width: 100%;
    }
</style>

<template>
    <div class="colcontainer">
        <div class="layout-favourites-enum">
            <i-menu theme="light" :active-name="activePath" @on-select="routerTo">
                <Menu-Item name="my-drives"><Icon type="android-open"></Icon> My Drives</Menu-Item>
                <Menu-Item name="my-wallet"><Icon type="social-usd"></Icon> My Wallet</Menu-Item>
            </i-menu>
        </div>
        <!-- 文件列表div -->
        <div class="layout-favourites-content">
            <transition mode="out-in">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeName: 'my-drives'
            }
        },
        created: function () {
            this.$router.push({ path: '/my-drives'});
        },
        computed: {
            activePath() {
              return this.$route.path.replace('/','');
            }
        },
        methods: {
            routerTo(e) {
                console.log(e);
                this.$router.push(e);
            }
        }
    }
</script>