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
            <el-menu :default-active="defaultActive" @select="(index)=>{defaultActive = index}" :router="true">
                <el-menu-item index="0" route="/my-drives">
                    <i class="el-icon-share"></i>
                    <span slot="title">My Drives</span>
                </el-menu-item>
                <el-menu-item index="1" route="/my-wallet">
                    <i class="el-icon-goods"></i>
                    <span slot="title">My Wallet</span>
                </el-menu-item>
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

    export default {
        data() {
            return {
                defaultActive: "0",
            }
        },
        created: function () {
             this.$router.push({ path: "/my-drives" });
        }
    }

</script>