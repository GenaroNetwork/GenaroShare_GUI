<template>
    <div>

        <el-dialog title="set recipient wallet" :visible.sync="setRecipientDialogVisible" width="600px" :center="true" v-loading="setRecipientDialogLoading">
            <el-form v-model="setWallet" label-position="top" size="small">
                <el-form-item label="Driver ID">
                    <el-input v-model="setWallet.nodeId" :disabled="true" type="string"></el-input>
                </el-form-item>
                <el-form-item label="quantity">
                    <el-input v-model="setWallet.quantity" type="number" min="5000" placeholder="set the quantity for stake, and will get a respond of size of sharing"></el-input>
                </el-form-item>
                <el-form-item label="option">
                    <el-select v-model="setWallet.option" placeholder="set the option for months to be shared">
                        <el-option v-for="(option, index) of setWallet.options" :key="`option-${index}`" :label="option.label" :value="option.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="choose wallet">
                    <el-select v-model="setWallet.wallet" placeholder="Choose a wallet as recipient">
                        <el-option v-for="(wallet, index) of setWallet.wallets" :key="`wallet-${index}`" :label="wallet.name" :value="wallet.address"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="wallet password">
                    <el-input v-model="setWallet.password" type="password" placeholder="input your wallet password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRecipientDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRecipient()">确 定</el-button>
            </span>
        </el-dialog>

        <div class="layout-header">
            <el-popover ref="popover" placement="bottom-end" trigger="click" v-model="addSharePop.visible">
                <div>
                    <h3>Drive Location</h3>
                    <p class="input-style" @click="selectFile">
                        <span v-if="addSharePop.file_path">{{addSharePop.file_path}}</span>
                        <span v-if="!addSharePop.file_path">Please select sharing directory</span>
                    </p>
                    <h3 style="margin-top:20px">Sharing Size</h3>
                    <el-input v-model="addSharePop.share_size">
                        <el-select v-model="addSharePop.select_unit" slot="append" style="width: 70px;">
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

        <el-dialog title="Notice" :visible.sync="dialogVisible" width="30%">
            <span>{{dialogMessage}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleDialog">确 定</el-button>
            </span>
        </el-dialog>
        <el-table :data="driversData" :empty-text="no_data">
            <el-table-column label="Drive ID" prop="id" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column label="Location" prop="location" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column label="Shared">
                <template slot-scope="scope">
                    <div>
                        <el-progress :percentage="scope.row.percentUsed"></el-progress>
                        <p>{{scope.row.spaceUsed}}/{{scope.row.storageAllocation}}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Uptime" prop="time">
            </el-table-column>
            <el-table-column label="Peers" prop="peers">
            </el-table-column>
            <el-table-column label="Allocs" prop="allocs" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column label="Bridges" prop="bridgesText">
            </el-table-column>
            <el-table-column label="Status">
                <template slot-scope="scope">
                    <el-popover ref="popover{{$index}}" placement="bottom-end" v-model="scope.row.show">
                        <div style="width:150px;text-align:center;">
                            <el-button type="text" @click="setRecipientDialog(scope.row)">Set recipient</el-button>
                            <br/>
                            <el-button type="text" @click="restartShare(scope.row)">Restart</el-button>
                            <br/>
                            <el-button type="text" @click="stopShare(scope.row)">Stop</el-button>
                            <br/>
                            <el-button type="text" @click="deleteShare(scope.row)">Delete
                            </el-button>
                        </div>
                    </el-popover>
                    <el-switch v-model="scope.row.statusSwitch" @change="buttonSwitch(scope.row)" style="margin-right: 15px;"></el-switch>
                    <el-button type="text" @click="morePop(scope.row)" v-popover:popover{{$index}}>
                        <i class="el-icon-more"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<style>
.layout-header {
  height: 80px;
}
.input-style {
  height: 40px;
  line-height: 40px;
  width: 200px;
  padding-left: 12px;
  padding-right: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #dddee1;
}
.id-style {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 15px;
}
.title {
  font-size: 30px;
  font-weight: bold;
  float: left;
  margin-left: 30px;
  width: 85%;
  margin-top: 25px;
}
.button1 {
  margin-left: 0;
  margin-top: 25px;
}
.button2 {
  width: 47%;
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
import Share from "../share/share";
import { web3 } from "../../../wallet/web3Util";
let share = new Share;
console.log(share);
const { dialog } = require('electron').remote;
export default {
    data() {
        return {
            setRecipientDialogVisible: false,
            setRecipientDialogLoading: false,
            setWallet: {
                nodeId: '',
                quantity: 0,
                wallet: '',
                wallets: [],
                password: '',
                option: null,
                options: [{
                    label: "A month",
                    value: 0,
                }, {
                    label: "3 months",
                    value: 2,
                }, {
                    label: "6 months",
                    value: 5,
                }, {
                    label: "A year",
                    value: 12,
                }]
            },
            driversData: [],
            connectId: "",
            no_data: "You have not shared storage space, hurry up and share it ...",
            addSharePop: {
                visible: false,
                select_unit: "GB",
                share_size: '1',
                file_path: null,
            },
            more_pop_visible: false,
            dialogVisible: false,
            dialogMessage: "",
            dialogType: 1,
            rowData: null,
        }
    },
    created() {
        share.showStatus((err, datas, connectId) => {
            if (this.more_pop_visible) return;
            if (datas) {
                this.driversData = datas;
                this.connectId = connectId;
            }
        });
    },
    methods: {
        selectFile() {
            var options = {
                title: 'Please choose the sharing space',
                properties: ['openDirectory']
            }
            var that = this;
            dialog.showOpenDialog(options, function (res) {
                if (res && res[0]) {
                    that.addSharePop.file_path = res[0];
                }
            });
        },
        addShare() {
            if (!this.addSharePop.file_path) {
                this.$message({
                    type: 'info',
                    message: 'Please choose the sharing space'
                });
                return;
            }
            share.addNewConfig(this.addSharePop.share_size, this.addSharePop.select_unit, this.addSharePop.file_path);
            this.addSharePop.visible = false;
        },
        cancelShare() {
            this.addSharePop.visible = false;
        },
        restartShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = "Do you confirm to restart your sharing node?";
            this.dialogType = 1;
            this.rowData = row;
        },
        stopShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = "Do you confirm to stop your sharing node? You can restart anytime later, but users cannot get their data during the time you stop, thus you cannot get reward and it will lower your device reputation score.";
            this.dialogType = 2;
            this.rowData = row;
        },
        deleteShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = "Do you confirm to delete your sharing node? You will lose all data stored on your drive and cannot get reward, also it will lower your device reputation score.";
            this.dialogType = 3;
            this.rowData = row;
        },
        handleDialog() {
            var row = this.rowData;
            if (row == null) {
                return;
            }
            switch (this.dialogType) {
                case 1:
                    if (this.connectId != "") {
                        this.$message({
                            type: 'info',
                            message: 'You can only connect one node at one time, please stop ' + this.connectId + ' first.'
                        });
                        return
                    }
                    row.show = false;
                    share.restartShare(row.id);
                    break;
                case 2:
                    row.show = false;
                    share.stopShare(row.id);
                    break;
                case 3:
                    row.show = false;
                    share.deleteShare(row.id, row.shareBasePath);
                    break;
            }
            this.dialogVisible = false;
            this.rowData = null;
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
                this.restartShare(row);
            } else {
                this.stopShare(row);
            }
        },
        setRecipientDialog(row) {
            this.setRecipientDialogVisible = true;
            this.setRecipientDialogLoading = false;
            this.setWallet.wallets = this.$store.state.WalletList.wallets;
            this.setWallet.nodeId = row.id;
            this.setWallet.wallet = null;
            this.setWallet.password = null;
            this.setWallet.quantity = null;
            this.setWallet.option = null;
        },
        async setRecipient() {
            try {
                this.setRecipientDialogLoading = true;
                let hash = await this.$store.dispatch("walletListSetPayment", {
                    address: this.setWallet.wallet,
                    password: this.setWallet.password,
                    option: this.setWallet.option,
                    nodeId: this.setWallet.nodeId,
                    quantity: this.setWallet.quantity,
                });
                this.setRecipientDialogLoading = false;
                this.setRecipientDialogVisible = false;
                this.$message.success("success");
            } catch (e) {
                this.setRecipientDialogLoading = false;
                this.$message.error(e.message);
            }
        }
    }
}
</script>
