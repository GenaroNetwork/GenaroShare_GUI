<template>
    <div>
        <el-dialog v-loading="drawWaiting" element-loading-background="rgba(0, 0, 0, 0.8)" :title="$t('dashboard.drive.yourReward')" :visible.sync="reward.showDialog" width="800px" :center="true" @open="reward.step = 0">
            <div v-if="reward.step===0">
                <el-row>
                    <el-col :span="8">{{ $t("dashboard.drive.yourStakeWallet") }}</el-col>
                    <el-col :span="8">{{ reward.stakeWallet }}</el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">{{ $t("dashboard.drive.youHaveEarned") }}</el-col>
                    <el-col :span="8">{{ reward.earnedGnx }} GNX</el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">{{ $t("dashboard.drive.transferFeeTip") }}</el-col>
                    <el-col :span="8">{{ reward.gasGnx }} GNX</el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">{{ $t("dashboard.drive.youWillGet") }}</el-col>
                    <el-col :span="8">{{ reward.earnedGnx - reward.gasGnx > 0 ? reward.earnedGnx - reward.gasGnx : 0 }} GNX</el-col>
                </el-row>
            </div>
            <div v-else-if="reward.step===1">
                <p>{{ $t("dashboard.drive.afterTransferTip") + reward.hash }}</p>
                <div class="txHash" @click="openRewardHash">{{ $t("dashboard.drive.viewInEtherscan") }}</div>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="reward.showDialog = false">{{ $t("common.close") }}</el-button>
                <el-button type="primary" @click="getReward(reward.id)" v-if="reward.step===0">{{ $t("common.draw") }}</el-button>
            </span>
        </el-dialog>

        <el-dialog :title="$t('dashboard.drive.stakeWallet')" :visible.sync="setRecipientDialogVisible" width="600px" :center="true" v-loading="setRecipientDialogLoading">
            <el-form v-model="setWallet" label-position="top" size="small">
                <el-form-item :label="$t('dashboard.drive.driverId')">
                    <el-input v-model="setWallet.nodeId" :disabled="true" type="string"></el-input>
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">                
                        <el-form-item :label="$t('dashboard.drive.quantity')">
                            <el-input v-model="setWallet.quantity" type="number" min="5000" :placeholder="$t('dashboard.drive.setQuantityTip')"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">                
                        <el-form-item :label="$t('dashboard.drive.gasprice')">
                            <el-input v-model="setWallet.gasPrice" type="number" min="4" :placeholder="$t('dashboard.drive.gaspriceholder')"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item>
                    <slot name="label">{{ $t('dashboard.drive.option') }}
                        <span style="padding-left: .5rem; color: #aaa;">{{ $t('dashboard.drive.setStakeMonthTip') }}</span>
                        <br/>
                    </slot>
                    <el-select v-model="setWallet.option" :placeholder="$t('dashboard.drive.chooseDuration')">
                        <el-option v-for="(option, index) of setWallet.options" :key="`option-${index}`" :label="option.label" :value="option.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <slot name="label">{{ $t('dashboard.drive.wallet') }}
                        <span style="padding-left: .5rem; color: #aaa;">{{ $t('dashboard.drive.chooseStakeWallet') }}</span>
                        <br/>
                    </slot>
                    <el-select v-model="setWallet.wallet" :placeholder="$t('dashboard.drive.chooseDuration')">
                        <el-option v-for="(wallet, index) of setWallet.wallets" :key="`wallet-${index}`" :label="wallet.name" :value="wallet.address"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('dashboard.drive.walletPassword')">
                    <el-input v-model="setWallet.password" type="password" :placeholder="$t('dashboard.drive.inputWalletPassword')"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRecipientDialogVisible = false">{{ this.$t("common.cancel") }}</el-button>
                <el-button type="primary" @click="stakeShare()">{{ this.$t("common.confirm") }}</el-button>
            </span>
        </el-dialog>

        <el-dialog :title="$t('dashboard.drive.stakeTransaction')" :visible.sync="showStakeTransactionDialog" width="600px" :center="true">
            <div>
                <p>{{ $t('dashboard.drive.stakeSuccessTip') + stakeTransaction }}</p>
                <div class="txHash" @click="openStakeTranscationHash" :center="true">{{ $t("dashboard.drive.viewInEtherscan") }}</div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showStakeTransactionDialog = false">{{ $t("common.close") }}</el-button>
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
            <div v-html="dialogMessage"></div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">{{ this.$t("common.cancel") }}</el-button>
                <el-button type="primary" @click="handleDialog">{{ this.$t("common.confirm") }}</el-button>
            </span>
        </el-dialog>
        <el-table :data="driversData" :empty-text="no_data">
            <el-table-column :label="$t('dashboard.drive.node')" min-width="180px" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <div>
                        <span>{{scope.row.id}}</span>
                        <br/>
                        <span>{{scope.row.location}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.status')">
                <template slot-scope="scope">
                    <span :class="scope.row.statusColor">{{scope.row.status}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.uptime')" prop="time">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.restarts')" prop="restarts">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.peers')" prop="peers">
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.allocs')" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <div>
                        <span>{{scope.row.contractCount}}</span>
                        <br/>
                        <span>{{scope.row.dataReceivedCount + ' received'}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.delta')">
                <template slot-scope="scope">
                    <p :class="scope.row.deltaColor">{{scope.row.delta}}</p>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.port')">
                <template slot-scope="scope">
                    <div :class="scope.row.portColor">
                        <span>{{scope.row.listenPort}}</span>
                        <br/>
                        <span>{{scope.row.connectionType}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.shared')" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <div>
                        <el-progress :percentage="scope.row.percentUsed"></el-progress>
                        <p>{{scope.row.spaceUsed}}/{{scope.row.storageAllocation}}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('dashboard.drive.bridges')" width="120px">
                <template slot-scope="scope">
                    <p :class="scope.row.bridgesColor">{{scope.row.bridgesText}}</p>
                </template>
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
                            <el-button type="text" @click="showLog(scope.row)">{{ $t("dashboard.drive.showLog") }}</el-button>
                            <br/>
                            <el-button type="text" @click="openConfig(scope.row)">{{ $t("dashboard.drive.openConfig") }}</el-button>
                            <br/>
                            <el-button type="text" @click="showReward(scope.row.id)">{{ $t("dashboard.drive.showReward") }}</el-button>
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

.text-gray {
    color: grey;
}
.text-green {
    color: green;
}
.text-red {
    color: red;
}
.text-yellow {
    color: yellow;
}
.text-orange {
    color: orange;
}
</style>
<script>
import * as share from "../../../lib/share";
import { web3, EtherscanURL } from "../../../wallet/web3Util";
import i18n from '../../i18n';
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
                gasPrice: 15,
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
            stakeTransaction: '',
            drawWaiting: false
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
                let data = {},
                    config = share.config,
                    farmerState = share.meta.farmerState || {},
                    portStatus = farmerState.portStatus || {},
                    ntpStatus = farmerState.ntpStatus || {};
                data.id = share.id;
                data.location = config.storagePath;
                data.shareBasePath = config.shareBasePath;
                data.spaceUsed = (!farmerState.spaceUsed || farmerState.spaceUsed == '...') ? "0KB" : farmerState.spaceUsed;
                data.storageAllocation = config.storageAllocation;
                data.percentUsed = farmerState.percentUsed == '...' ? 0 : farmerState.percentUsed;
                data.time = prettyms(share.meta.uptimeMs);
                data.restarts = share.meta.numRestarts || 0;
                data.peers = farmerState.totalPeers;
                data.contractCount = farmerState.contractCount || 0;
                data.dataReceivedCount = farmerState.dataReceivedCount || 0;
                data.bridges = farmerState.bridgesConnectionStatus || 0;
                data.allocs = data.bridges === 0 ? 0 : data.contractCount + '(' + data.dataReceivedCount + 'received)'; 
                
                data.listenPort = portStatus.listenPort;
                data.connectionType = portStatus.connectionType;
                switch (portStatus.connectionStatus) {
                    case 0:
                        data.portColor = 'text-green';
                        break;
                    case 1:
                        data.portColor = 'text-yellow';
                        break;
                    case 2:
                        data.portColor = 'text-red';
                        break;
                }

                // data.statusLight = portStatus.connectionStatus !== undefined ? portStatus.connectionStatus : -1;
                let localeDrive = i18n.messages[i18n.locale].dashboard.drive;
                switch (data.bridges) {
                    case 0:
                        data.bridgesText = localeDrive.disconnected;
                        data.bridgesColor = 'text-gray';
                        break;
                    case 1:
                        data.bridgesText = localeDrive.connecting;
                        data.bridgesColor = 'text-yellow';
                        break;
                    case 2:
                        data.bridgesText = localeDrive.confirming;
                        data.bridgesColor = 'text-orange';
                        break;
                    case 3:
                        data.bridgesText = localeDrive.connected;
                        data.bridgesColor = 'text-green';
                        break;
                }

                data.state = share.state;
                switch (data.state) {
                    case 0:
                        data.statusSwitch = false;
                        data.status = 'stopped';
                        data.statusColor = 'text-gray'; 
                        break;
                    case 1:
                        data.statusSwitch = true;
                        connectId = share.id;
                        data.status = 'running';
                        data.statusColor = 'text-green'; 
                        break;
                    case 2:
                        data.statusSwitch = false;
                        data.status = 'errored';
                        data.statusColor = 'text-red'; 
                        break;
                    default:
                        data.status = 'unknown';
                        break;
                }

                data.delta = ntpStatus.delta || '...';
                switch (ntpStatus.status) {
                    case 0:
                        data.deltaColor = 'text-green';
                        break;
                    case 1:
                        data.deltaColor = 'text-yellow';
                        break;
                    case 2:
                        data.deltaColor = 'text-red';
                        break;
                }

                data.show = false;

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
                    this.$message.error({message: err.message, showClose: true, duration: 0});
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
            this.drawWaiting = true;
            if (!this.reward.stakeWallet || this.reward.stakeWallet === '0x0000000000000000000000000000000000000000') {
                this.$message.error({message: this.$t('dashboard.drive.nodeNoStakeTip'), showClose: true, duration: 0});
                this.drawWaiting = false;
                return;
            }
            share.getReward(nodeid, (err, obj) => {
                this.drawWaiting = false;
                if (err) {
                    this.$message.error({message: err.message, showClose: true, duration: 0});
                    return;
                }
                if (obj.error) {
                    this.$message.error({message: obj.error, showClose: true, duration: 0});
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
            this.dialogMessage = this.$t('dashboard.drive.restartConfirmTip');
            this.dialogType = 1;
            this.rowData = row;
        },
        startShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = this.$t('dashboard.drive.startConfirmTip');
            this.dialogType = 1;
            this.rowData = row;
        },
        stopShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = this.$t('dashboard.drive.stopConfirmTip');
            this.dialogType = 2;
            this.rowData = row;
        },
        deleteShare(row) {
            this.dialogVisible = true;
            this.dialogMessage = this.$t('dashboard.drive.deleteConfirmTip');
            this.dialogType = 3;
            this.rowData = row;
        },
        stakeShare() {
            this.dialogVisible = true;
            this.dialogMessage = this.$t('dashboard.drive.stakeConfirmTip');
            this.dialogType = 4;
        },
        showLog(row) {
            share.openLogFolder()
        },
        openConfig(row) {
            share.openConfig(row.id)
        },
        handleDialog() {
            var row = this.rowData;
            if (row == null && this.dialogType !== 4) {
                return;
            }
            switch (this.dialogType) {
                case 1:
                    row.show = false;
                    share.restart(row.id, (err) => { 
                        if(err) {
                            if(err.message === 'Please STAKE first.') {
                                this.$message.error({message: this.$t('dashboard.drive.stakeFirstTip'), showClose: true, duration: 0});
                            }
                            else {
                                this.$message.error({message: err.message, showClose: true, duration: 0});
                            }
                        }
                    });
                    break;
                case 2:
                    row.show = false;
                    share.stop(row.id);
                    break;
                case 3:
                    row.show = false;
                    share.destroy(row.id, (err) => {
                        if(err) {
                            this.$message.error({message: err.message, showClose: true, duration: 0});
                        }
                    });
                    break;
                case 4:
                    this.setRecipient();
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
            this.setWallet.gasPrice = 15;
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
                    gasPrice: this.setWallet.gasPrice
                });
                this.setRecipientDialogLoading = false;
                this.setRecipientDialogVisible = false;
                // this.$message.success("Success.The transactionHash is: " + hash.transactionHash);
                this.showStakeTransactionDialog = true;
                this.stakeTransaction = hash.transactionHash;
            } catch (e) {
                this.setRecipientDialogLoading = false;
                this.$message.error({message: e.message, showClose: true, duration: 0});
            }
        }
    }
}
</script>
