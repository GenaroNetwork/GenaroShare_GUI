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
  width: calc(100% - 220px);
}
.colcontainer {
  display: flex;
  width: 100%;
}
.layout-favourites-enum {
  position: relative;
}
.icon {
  width: 15px;
  height: 15px;
  vertical-align: middle;
}

a {
  position: absolute;
  bottom: 36px;
  left: 0;
  right: 0;
  margin: auto;
  float: left;
  text-align: center;
}

.version {
  font-size: 14px;
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  margin: auto;
  float: left;
  text-align: center;
}
.version > .update {
  background-color: #409eff;
  color: #fff;
  padding: 2px;
}
</style>

<template>
    <div class="colcontainer">
        <div class="layout-favourites-enum">
            <el-menu default-active="0" :router="true">
                <el-menu-item index="0" route="/my-drives">
                    <i class="material-icons">storage</i>
                    <span>{{ $t("dashboard.drive.mydrives") }}</span>
                </el-menu-item>
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
            <a @click="openAgreement" href="javascript: void(0);">{{ $t("menu.help.tutorial") }}</a>        
            <div class="version">
                <span>{{ currentVersion }}</span>
                <el-button v-if="hasNewVersion" type="text" @click="openDownloadPage" class="update">{{ $t('common.updateVersion') }}</el-button>
            </div>
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
import { shell } from "electron";
import { version } from "../../../package.json";
import { CHECK_MAC_UPDATE_URL, CHECK_WIN_UPDATE_URL } from "../../config";

export default {
    data() {
        return {
            activeName: 'my-drives',
            drive_icon: drive_select,
            wallet_icon: wallet_unselect,
            isMac: true,
            hasNewVersion: false,
            currentVersion: ""
        }
    },
    created: function () {
        this.routerTo("my-drives");
        if (require("os").platform() !== "darwin") {
            this.isMac = false;
        }
        this.currentVersion = version;
    },
    computed: {
        activePath() {
            return this.$route.path.replace('/', '');
        }
    },
    mounted() {
        this.checkVersion();
        setInterval(() => {
            this.checkVersion();
        }, 60 * 60 * 1000);
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
        },
        openAgreement() {
            shell.openExternal("https://genaro.network/");
        },
        async getLatestVersion(callback) {
           try {
                let response;
                if (this.isMac) {
                    response = await this.$http.get(CHECK_MAC_UPDATE_URL);
                } else {
                    response = await this.$http.get(CHECK_WIN_UPDATE_URL);
                }
                if (!response) {
                    return callback(null);
                }
                return callback(null, response.data);
            } catch (error) {
                return callback(error.message);
            }
        },
        compareVersion(currentVersion, latestVersion) {
            let lv = latestVersion.split("."),
            cv = currentVersion.split("."),
            isLatest = true;
            for (let index = 0, length = lv.length; index < length; index++) {
                let lvn = parseInt(lv[index]),
                cvn = parseInt(cv[index] || 0);
                if (lvn > cvn) {
                    isLatest = false;
                    break;
                }
            }
            return isLatest;
        },
        openDownloadPage() {
            this.getLatestVersion((err, data) => {
                if (err) {
                    return this.$message.error(err.message);
                }
                if (!data || !data.version) {
                    return;
                }
                if (this.compareVersion(this.currentVersion, data.version)) {
                    this.$message.info(
                        "The current version has already been the latest version"
                    );
                    this.hasNewVersion = false;
                    return;
                }
                if (!data.url) {
                    return this.$message.error("Error Url");
                }
                shell.openExternal(data.url);
            });
        },
        checkVersion() {
            this.getLatestVersion((err, data) => {
                if (err) {
                    return this.$message.error(err.message);
                }
                if (!data || !data.version) {
                    return;
                }
                if (this.compareVersion(this.currentVersion, data.version)) {
                    return;
                }
                this.hasNewVersion = true;
                this.$message.info(
                    "A new version has been found.Please update as soon as possible."
                );
            });
        }
    }
}
</script>