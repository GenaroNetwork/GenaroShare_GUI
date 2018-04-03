<template>
    <div>
        <el-dialog title="Your reward" :visible.sync="reward.showDialog" width="800px" :center="true" @open="reward.step = 0">
            <div v-if="reward.step===0">
                <el-row>
                    <el-col :span="8">Your stake wallet: </el-col>
                    <el-col :span="8">{{ reward.stakeWallet }}</el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">You have earned: </el-col>
                    <el-col :span="8">{{ reward.earnedGnx }} GNX</el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">The transfer fee will be:</el-col>
                    <el-col :span="8">{{ reward.gasGnx }} GNX</el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">You will get :</el-col>
                    <el-col :span="8">{{ reward.earnedGnx - reward.gasGnx > 0 ? reward.earnedGnx - reward.gasGnx : 0 }} GNX</el-col>
                </el-row>
            </div>
            <div v-else-if="reward.step===1">
                <p>GNX transferring. Transaction hash: {{ reward.hash }}</p>
                <div class="txHash" @click="openRewardHash">view in etherscan</div>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="reward.showDialog = false">关闭</el-button>
                <el-button type="primary" @click="getReward(reward.id)" v-if="reward.step===0">提取</el-button>
            </span>
        </el-dialog>

        <el-dialog title="stake wallet" :visible.sync="setRecipientDialogVisible" width="600px" :center="true" v-loading="setRecipientDialogLoading">
            <el-form v-model="setWallet" label-position="top" size="small">
                <el-form-item label="Driver ID">
                    <el-input v-model="setWallet.nodeId" :disabled="true" type="string"></el-input>
                </el-form-item>
                <el-form-item label="quantity">
                    <el-input v-model="setWallet.quantity" type="number" min="5000" placeholder="set the quantity for stake, and will get a respond of size of sharing"></el-input>
                </el-form-item>
                <el-form-item>
                    <slot name="label">option
                        <span style="padding-left: .5rem; color: #aaa;">Set the option for months to be shared</span>
                        <br/>
                    </slot>
                    <el-select v-model="setWallet.option" placeholder="choose duration">
                        <el-option v-for="(option, index) of setWallet.options" :key="`option-${index}`" :label="option.label" :value="option.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <slot name="label">wallet
                        <span style="padding-left: .5rem; color: #aaa;">Choose a wallet to stake</span>
                        <br/>
                    </slot>
                    <el-select v-model="setWallet.wallet" placeholder="choose a wallet">
                        <el-option v-for="(wallet, index) of setWallet.wallets" :key="`wallet-${index}`" :label="wallet.name" :value="wallet.address"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="wallet password">
                    <el-input v-model="setWallet.password" type="password" placeholder="input your wallet password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRecipientDialogVisible = false">{{ this.$t("common.cancel") }}</el-button>
                <el-button type="primary" @click="setRecipient()">{{ this.$t("common.confirm") }}</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Stake Transaction" :visible.sync="showStakeTransactionDialog" width="600px" :center="true">
            <div>
                <p>The transaction has been sent successfunlly.Transaction hash: {{ stakeTransaction }}</p>
                <div class="txHash" @click="openStakeTranscationHash" :center="true">view in etherscan</div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showStakeTransactionDialog = false">Close</el-button>
            </span>
        </el-dialog>

        <div class="layout-header">
            <el-popover ref="popover" placement="bottom-end" trigger="click" v-model="addSharePop.visible">
                <div>
                    <h3>{{ $t("dashboard.drive.drivelocation") }}</h3>
                    <p class="input-style" @click="selectFile">
                        <span v-if="addSharePop.file_path">{{addSharePop.file_path}}</span>
                        <span v-if="!addSharePop.file_path">{{ $t("dashboard.drive.selectsharing") }}</span>
                    </p>
                    <h3 style="margin-top:20px">{{ $t("dashboard.drive.sharingsize") }}</h3>
                    <el-input v-model="addSharePop.share_size">
                        <el-select v-model="addSharePop.select_unit" slot="append" style="width: 70px;">
                            <el-option value="GB">GB</el-option>
                            <el-option value="TB">TB</el-option>
                        </el-select>
                    </el-input>
                    <div style="margin-top:45px">
                        <el-button class="button2" @click="cancelShare">{{ $t("el.datepicker.cancel") }}</el-button>
                        <el-button type="primary" class="button2" @click="addShare">{{ $t("common.next") }}</el-button>
                    </div>
                </div>
            </el-popover>
            <p class="title" id="title">{{ $t("dashboard.drive.mydrives") }}</p>
            <el-button type="primary" v-popover:popover class="button1">{{ $t("dashboard.drive.adddrive") }}</el-button>

        </div>

        <el-dialog :title="$t('dashboard.drive.notice')" :visible.sync="dialogVisible" width="30%">
            <span>{{dialogMessage}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">{{ this.$t("common.cancel") }}</el-button>
                <el-button type="primary" @click="handleDialog">{{ this.$t("common.confirm") }}</el-button>
            </span>
        </el-dialog>
        <el-table :data="driversData" :empty-text="no_data">
            <el-table-column :label="$t('dashboard.drive.status')" width="70px">
                <template slot-scope="scope">
                    <div class="status-light green" v-if="!scope.row.statusLight"></div>
                    <div class="status-light red" v-else></div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.driveid')" prop="id" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.location')" prop="location" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.shared')">
                <template slot-scope="scope">
                    <div>
                        <el-progress :percentage="scope.row.percentUsed"></el-progress>
                        <p>{{scope.row.spaceUsed}}/{{scope.row.storageAllocation}}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.uptime')" prop="time">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.peers')" prop="peers">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.allocs')" prop="allocs" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.bridges')" prop="bridgesText">
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <el-popover ref="popover{{$index}}" placement="bottom-end" v-model="scope.row.show">
                        <div style="width:150px;text-align:center;">
                            <el-button type="text" @click="setRecipientDialog(scope.row)">{{ $t("dashboard.drive.setrecipient") }}</el-button>
                            <br/>
                            <el-button type="text" @click="restartShare(scope.row)">{{ $t("dashboard.drive.restart") }}</el-button>
                            <br/>
                            <el-button type="text" v-if="scope.row.statusSwitch" @click="stopShare(scope.row)">{{ $t("dashboard.drive.stop") }}</el-button>
                            <el-button type="text" v-else @click="startShare(scope.row)">{{ $t("dashboard.drive.start") }}</el-button>
                            <br/>
                            <el-button type="text" @click="deleteShare(scope.row)">{{ $t("common.delete") }}</el-button>
                            <br/>
                            <el-button type="text" @click="showLog(scope.row)">Show Log</el-button>
                            <br/>
                            <el-button type="text" @click="openConfig(scope.row)">Open Config</el-button>
                            <br/>
                            <el-button type="text" @click="showReward(scope.row.id)">Show Reward</el-button>
                        </div>
                    </el-popover>
                    <el-button type="text" @click="morePop(scope.row)" v-popover:popover{{$index}}>
                        <i class="el-icon-more"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<style scoped>
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
  width: calc(100% - 180px);
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

.status-light {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  margin: 0 10px;
}
.status-light.red {
  background: #ff6167;
}
.status-light.green {
  background: #37b047;
}

.txHash {
  color: #3498db;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
</style>
<script>
import * as share from "../../../lib/share";
import { web3, EtherscanURL } from "../../../wallet/web3Util";
import { shell } from "electron";
const prettyms = require('pretty-ms')
import dnode from "dnode";

const { dialog } = require('electron').remote;

export default {
    data() {
        return {
            reward: {
                id: null,
                stakeWallet: null,
                showDialog: false,
                step: 0,
                earnedGnx: 0,
                gasGnx: 0,
                hash: null,
            },
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
            addSharePop: {
                visible: false,
                select_unit: "GB",
                share_size: 100,
                file_path: null,
            },
            more_pop_visible: false,
            dialogVisible: false,
            dialogMessage: "",
            dialogType: 1,
            rowData: null,
            showStakeTransactionDialog : false,
            stakeTransaction: ''
        }
    },
    computed: {
        no_data: {
            get: function () { return this.$t('dashboard.drive.haventshared') }
        }
    },
    created() {
        function _convertData(shares) {
            let datas = [];
            let connectId = "";
            shares.forEach(share => {
                let data = {};
                data.id = share.id;
                data.location = share.config.storagePath;
                data.shareBasePath = share.config.shareBasePath;
                data.spaceUsed = share.meta.farmerState.spaceUsed == '...' ? "0KB" : share.meta.farmerState.spaceUsed;
                data.storageAllocation = share.config.storageAllocation;
                data.percentUsed = share.meta.farmerState.percentUsed == '...' ? 0 : share.meta.farmerState.percentUsed;
                data.time = prettyms(share.meta.uptimeMs);
                data.peers = share.meta.farmerState.totalPeers;
                data.contractCount = share.meta.farmerState.contractCount;
                data.dataReceivedCount = share.meta.farmerState.dataReceivedCount;
                data.bridges = share.meta.farmerState.bridgesConnectionStatus || 0;
                data.allocs = data.bridges === 0 ? 0 : data.contractCount + '(' + data.dataReceivedCount + 'received)'; 
                data.statusLight = share.meta.farmerState.portStatus ? share.meta.farmerState.portStatus.connectionStatus : -1;
                switch (data.bridges) {
                    case 0:
                        data.bridgesText = 'Disconnected';
                        data.bridgesColor = '#FD4B24';
                        break;
                    case 1:
                        data.bridgesText = 'Connecting';
                        data.bridgesColor = '#FD4B24';
                        break;
                    case 2:
                        data.bridgesText = 'Confirming';
                        data.bridgesColor = '#FD4B24';
                        break;
                    case 3:
                        data.bridgesText = 'Connected';
                        data.bridgesColor = '#31A63B';
                        break;
                }

                data.status = share.state;
                switch (data.status) {
                    case 0:
                        data.statusSwitch = false;
                        break;
                    case 1:
                        data.statusSwitch = true;
                        connectId = share.id;
                        break;
                    case 2:
                        data.statusSwitch = false;
                        break;
                }
                data.delta = share.meta.farmerState.ntpStatus ? share.meta.farmerState.ntpStatus.delta : 9999;
                data.show = false;
                // data.listenPort = share.meta.farmerState.portStatus.listenPort;

                datas.push(data);
            })
            return datas
        }
        share.shareEventEmitter.on('statusUpdate', status => {
            let datas = _convertData(status)
            if (this.more_pop_visible) return;
            if (datas) {
                this.driversData = datas;
            }
        });
        
    },
    methods: {
        showReward(nodeid) {
            share.checkReward(nodeid, (err, obj) => {
                if (err) {
                    this.$message.error(err.message);
                    return;
                }
                this.reward.id = nodeid;
                this.reward.earnedGnx = obj.earnedGnx;
                this.reward.stakeWallet = obj.wallet;
                this.reward.gasGnx = obj.gasGnx;
                this.reward.showDialog = true;
            });
        },
        getReward(nodeid) {
            if (!this.reward.stakeWallet || this.reward.stakeWallet === '0x0000000000000000000000000000000000000000') {
                this.$message.error('this node has not been staked');
                return;
            }
            share.getReward(nodeid, (err, obj) => {
                if (err) {
                    this.$message.error(err.message);
                    return;
                }
                if (obj.error) {
                    this.$message.error(obj.error);
                    return;
                }
                this.reward.hash = obj.txHash;
                this.reward.step = 1;
            });
        },
        openRewardHash() {
            shell.openExternal(EtherscanURL + this.reward.hash);
        },
        openStakeTranscationHash() {
            shell.openExternal(EtherscanURL + this.stakeTransaction);
        },
        selectFile() {
            var options = {
                title: this.$t('dashboard.drive.choosesharing'),
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
            let that = this;
            if (!this.addSharePop.file_path) {
                this.$message({
                    type: 'info',
                    message: that.$t('dashboard.drive.choosesharing')
                });
                return;
            }
            let nodeId = share.create(this.addSharePop.share_size, this.addSharePop.select_unit, this.addSharePop.file_path);
            share.start(nodeId)
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
        startShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = "Do you confirm to start your sharing node?";
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
        showLog(row) {
            share.openLogFolder()
        },
        openConfig(row) {
            share.openConfig(row.id)
        },
        handleDialog() {
            var row = this.rowData;
            if (row == null) {
                return;
            }
            switch (this.dialogType) {
                case 1:
                    row.show = false;
                    share.restart(row.id, (err) => { this.$message.error(err.message);});
                    break;
                case 2:
                    row.show = false;
                    share.stop(row.id);
                    break;
                case 3:
                    row.show = false;
                    share.destory(row.id);
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
                // this.$message.success("Success.The transactionHash is: " + hash.transactionHash);
                this.showStakeTransactionDialog = true;
                this.stakeTransaction = hash.transactionHash;
            } catch (e) {
                this.setRecipientDialogLoading = false;
                this.$message.error(e.message);
            }
        }
    }
}
</script>
