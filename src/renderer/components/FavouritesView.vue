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
    .icon {
        width: 15px;
        height: 15px;
        vertical-align: middle;
    }
</style>

<template>
    <div class="colcontainer">
        <div class="layout-favourites-enum">
            <i-menu theme="light" :active-name="activePath" @on-select="routerTo">
                <Menu-Item name="my-drives"><img :src="drive_icon" class="icon"> My Drives</Menu-Item>
                <Menu-Item name="my-wallet"><img :src="wallet_icon" class="icon"> My Wallet</Menu-Item>
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
    import drive_unselect from './../assets/drive_unselect@2x.png';
    import drive_select from './../assets/drive_select@2x.png';
    import wallet_unselect from './../assets/wallet_unselect@2x.png';
    import wallet_select from './../assets/wallet_select@2x.png';

    export default {
        data() {
            return {
                activeName: 'my-drives',
                drive_icon: drive_select,
                wallet_icon: wallet_unselect
            }
        },
        created: function () {
            this.routerTo("my-drives");
        },
        computed: {
            activePath() {
              return this.$route.path.replace('/','');
            }
        },
        methods: {
            routerTo(e) {
                console.log(e);
                switch(e) {
                    case 'my-drives':
                        this.drive_icon = drive_select;
                        this.wallet_icon = wallet_unselect;
                    break;
                    case 'my-wallet':
                        this.drive_icon = drive_unselect;
                        this.wallet_icon = wallet_select;
                    break;
                }
                this.$router.push({ path: '/' + e});
            }
        }
    }
</script>