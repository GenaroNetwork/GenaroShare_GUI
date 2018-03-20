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
            <el-menu default-active="0" :router="true">
                <el-menu-item index="0" route="/my-drives"><img :src="drive_icon" class="icon">{{ $t("dashboard.drive.mydrives") }}</el-menu-item>
                <el-submenu index="1" default-active="1-0">
                    <template slot="title">
                        <i class="material-icons">account_balance_wallet</i>
                        <span slot="title">{{ $t("dashboard.mywallet.mywallet") }}</span>
                    </template>
                    <el-menu-item index="1-0" route="/wallet">
                        <span slot="title">{{ $t("dashboard.mywallet.mywallet") }}</span>
                    </el-menu-item>
                    <el-menu-item index="1-1" route="/wallet-manager">
                        <span slot="title">{{ $t("dashboard.walletmanage.walletmanage") }}</span>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
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
            return this.$route.path.replace('/', '');
        }
    },
    methods: {
        routerTo(e) {
            console.log(e);
            switch (e) {
                case 'my-drives':
                    this.drive_icon = drive_select;
                    this.wallet_icon = wallet_unselect;
                    break;
                case 'my-wallet':
                    this.drive_icon = drive_unselect;
                    this.wallet_icon = wallet_select;
                    break;
            }
            this.$router.push({ path: '/' + e });
        }
    }
}
</script>