<template xmlns:v-popover="">
    <div>
        <div class="layout-header">
            <el-popover ref="popover" placement="bottom-end" trigger="click" v-model="add_share_pop_visible">
                <div>
                    <h3>Drive Location</h3>
                    <p class="input-style" @click="selectFile">{{file_path}}</p>
                    <h3 style="margin-top:20px">Sharing Size</h3>
                    <el-input v-model="share_size">
                        <el-select v-model="select_unit" slot="append" style="width: 70px;">
                            <el-option value="GB">GB</el-option>
                            <el-option value="TB">TB</el-option>
                        </el-select>
                    </el-input>
                    <div style="margin-top:45px">
                        <el-button class="button2" @click="cancelShare">Cancel</el-button>
                        <el-button type="primary" class="button2" @click="addShare">Next</el-button>
                    </div>
                </div>
            </el-popover>
            <p class="title" id="title">My Drives</p>
            <el-button type="primary" v-popover:popover class="button1">+ Add Drive</el-button>

        </div>
        <el-table :data="data1" :empty-text="no_data">
            <el-table-column label="Drive ID">
                <template slot-scope="scope">
                    <p class="id-style">{{scope.row.id}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Location">
                <template slot-scope="scope">
                    <p class="id-style">{{scope.row.location}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Shared">
                <template slot-scope="scope">
                    <div>
                        <el-progress :percentage="scope.row.percentUsed"></el-progress>
                        <p>{{scope.row.spaceUsed}}/{{scope.row.storageAllocation}}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Uptime">
                <template slot-scope="scope">
                    <p class="font-size:15px">{{scope.row.time}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Peers">
                <template slot-scope="scope">
                    <p class="font-size:15px">{{scope.row.peers}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Allocs">
                <template slot-scope="scope">
                    <p class="font-size:15px">{{scope.row.allocs}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Bridges">
                <template slot-scope="scope">
                    <div>
                        <p style="font-size:13px;margin-left:15px;">{{scope.row.bridgesText}}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Status">
                <template slot-scope="scope">
                    <el-popover ref="popover{{$index}}" placement="bottom-end" v-model="scope.row.show">
                        <div style="width:150px;text-align:center;">
                            <el-button type="text" @click="restartShare(scope.row)">Restart</el-button><br/>
                            <el-button type="text" @click="stopShare(scope.row)">Stop</el-button><br/>
                            <el-button type="text" @click="deleteShare(scope.row, scope.row.shareBasePath)">Delete</el-button>
                        </div>
                    </el-popover>
                    <el-switch v-model="scope.row.statusSwitch" @change="buttonSwitch(scope.row)"></el-switch>
                    <span style="margin-left:15px;" @click="morePop(scope.row)" v-popover:popover{{$index}}>
                        <i class="el-icon-more"></i>
                    </span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<style>
    .layout-header {
        height:80px;
    }
    .input-style {
        height:40px;
        line-height:40px;
        line-width:200px;
        padding-left:12px;
        padding-right:12px;
        text-overflow:ellipsis;
        overflow: hidden;
        border-radius:4px;
        border:1px solid #DDDEE1;
    }
    .id-style {
        overflow:hidden;
        white-space: nowrap;
        text-overflo: ellipsis;
        font-size: 15px;
    }
    .title {
        font-size: 30px;
        font-weight: bold;
        float:left;
        margin-left:30px;
        width:85%;
        margin-top:25px;
    }
    .button1 {
        margin-left:title.width;
        margin-top:25px;
    }
    .button2 {
        width:47%;
    }
    .circle {
        width: 10px;
        height: 10px;
        background: red;
        -moz-border-radius: 50px;
        -webkit-border-radius: 50px;
        border-radius: 50px;
    }


</style>
<script>
    import share from "../share/share.js"
    const {dialog} = require('electron').remote

    export default {
        data () {
            return {
                data1: [],
                no_data:"You have not shared storage space, hurry up and share it ...",
                select_unit: "GB",
                share_size: '1',
                file_path: 'Please choose the sharing space',
                add_share_pop_visible: false,
                more_pop_visible: false
            }
        },
        created() {
            var that = this;
            share.showStatus(function(err, datas){
                if (that.more_pop_visible) return;
                if (datas) {
                    that.data1 = datas;
                }
            });
        },
        methods: {
            selectFile() {
                var options = {
                    title: '请选择文件夹',
                    defaultPath: "share"
                }
                var that = this;
                dialog.showSaveDialog(options, function(res) {
                    if(!res) {
                        that.file_path = 'Please choose the sharing space';
                        return;
                    }
                    that.file_path = res;
                });
            },
            addShare() {
                if (this.file_path.indexOf("Please") > -1) {
                    this.$message({
                        type: 'info',
                        message: 'Please choose the sharing space'
                    });
                    return;
                }
                share.addNewConfig(this.share_size, this.select_unit, this.file_path);
                this.add_share_pop_visible = false;
            },
            cancelShare() {
                this.add_share_pop_visible = false;
            },
            deleteShare(row, shareBasePath) {
                row.show = false;
                share.deleteShare(row.id, shareBasePath);
            },
            restartShare(row) {
                row.show = false;
                share.restartShare(row.id);
            },
            stopShare(row) {
                row.show = false;
                share.stopShare(row.id);
            },
            morePop(row) {
                this.more_pop_visible = true;
                row.show = true;
                setTimeout(() => {
                    row.show = false;
                    this.more_pop_visible = false;
                }, 5000)
            },
            buttonSwitch(row) {
                if (row.statusSwitch) {
                    share.restartShare(row.id);
                } else {
                    share.stopShare(row.id);
                }
            }

        }
    }













</script>
