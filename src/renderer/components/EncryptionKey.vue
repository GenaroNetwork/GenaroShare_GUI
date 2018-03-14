<style scoped lang="less">
.content {
  width: 700px;
  margin: 100px auto;
  text-align: center;
  font-size: 16px;
}
.content img.explain-img {
  width: 200px;
  height: auto;
  margin: 40px auto;
}
.back-btn {
  left: 3px;
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
}
.navigation {
  position: relative;
}
h1 {
  font-weight: normal;
  font-size: 16px;
}
h2 {
  font-weight: normal;
  font-size: 20px;
}
.desc {
  margin: 2em auto;
}
.desc p {
  text-align: left;
  margin: 30px auto;
  color: #949494;
}
.main-area {
  padding: 0 60px;
}
div.key-area {
  background-color: #ececec;
  padding: 10px;
  border-radius: 4px;
  text-align: left;
}
.action-area {
  margin: 30px auto;
}
.key-action {
  margin-top: 10px;
  text-align: center;
}
.account {
  overflow: hidden;
  .avatar {
    float: left;
    height: 100px;
    width: 100px;
    margin-right: 25px;
  }
  .info {
    float: left;
    padding: 10px 0;
    div {
      text-align: left;
      line-height: 40px;
    }
  }
}
</style>

<template>
    <div class="content">
        <el-card v-if="showPage === 'newOrReturn'">
            <div class="navigation clearfix" slot="header">
                <h1>{{ $t('encryption.setkey') }}</h1>
            </div>
            <div class='newOrReturn'>
                <img class="explain-img" src="~@/assets/img/key_generate.png">
                <br>
                <el-button type="primary" @click="gotoGenerate()" long>{{ $t('encryption.nokey') }}</el-button>
                <br>
                <el-button type="text" @click="gotoInput()" long>{{ $t('encryption.havekey') }}</el-button>
            </div>
        </el-card>
        <el-card v-else-if="showPage === 'generate'">
            <div class="navigation clearfix" slot="header">
                <el-button class="back-btn" type="text" @click="gotoNewOrReturn()" icon="el-icon-arrow-left">{{ $t('common.back') }}</el-button>
                <h1>{{ $t('encryption.setkey') }}</h1>
            </div>
            <div class='main-area'>
                <div class="desc">
                    <span v-html="$t('encryption.genkeystep1')"></span>
                </div>

                <div class="key-area">
                    <p>{{encryptionKey}}</p>
                    <div class="key-action">
                        <el-button-group>
                            <el-button @click="randomKey()" icon="el-icon-refresh" size="mini">{{ $t('encryption.regenkey') }}</el-button>
                            <el-button @click="saveKey()" icon="el-icon-download" size="mini">{{ $t('dashboard.myfiles.download').toLocaleLowerCase() }}</el-button>
                            <el-button @click="copyKey()" size="mini">{{ $t('menu.edit.copy').toLocaleLowerCase() }}</el-button>
                        </el-button-group>
                    </div>
                </div>
                <div class="action-area">
                    <el-button type="primary" @click="gotoConfirmMatch()" long>{{ $t('encryption.keywrittendown') }}</el-button>
                </div>
            </div>
        </el-card>
        <el-card v-else-if="showPage === 'confirm'">
            <div class="navigation clearfix" slot="header">
                <el-button class="back-btn" type="text" @click="regenKey()" icon="el-icon-arrow-left">{{ $t('common.back') }}</el-button>
                <h1>{{ $t('encryption.setkey') }}</h1>
            </div>
            <div class="main-area">
                <div class="desc">
                    <span v-html="$t('encryption.genkeystep2')"></span>
                </div>
                <div class="key-area">
                    <el-input type="textarea" :rows="2" :placeholder="$t('encryption.confirmmsg')" v-model="keyConfirm">
                    </el-input>
                </div>
                <div class="action-area">
                    <el-button type="primary" @click="validateKeyMatchAndSubmit()" long>{{ $t('common.continue') }}</el-button>
                </div>
            </div>
        </el-card>
        <el-card v-else-if="showPage === 'inputKey'">
            <div class="navigation clearfix" slot="header">
                <el-button class="back-btn" type="text" @click="gotoNewOrReturn()" icon="el-icon-arrow-left">{{ $t('common.back') }}</el-button>
                <h1>{{ $t('encryption.setkey') }}</h1>
            </div>
            <div class='main-area'>
                <div class="desc">
                    <span v-html="$t('encryption.inputexistingkey')"></span>
                </div>
                <div class="key-area">
                    <el-input type="textarea" :rows="2" :placeholder="$t('encryption.yourkey')" v-model="encryptionKey">
                    </el-input>
                </div>
                <div class="action-area">
                    <el-button type="primary" @click="confirm()" long>{{ $t('common.continue') }}</el-button>
                </div>
            </div>
        </el-card>
        <el-card v-else-if="showPage === 'setPassword'">
            <div class="navigation clearfix" slot="header">
                <el-button class="back-btn" type="text" @click="gotoNewOrReturn()" icon="el-icon-arrow-left">{{ $t('common.back') }}</el-button>
                <h1>{{ $t('encryption.setkey') }}</h1>
            </div>
            <div class='main-area'>
                <div class="desc">
                    <span v-html="$t('encryption.inputpassword')"></span>
                </div>
                <el-form :rules="ruleInline" ref="walletPassword" :model="walletPass">
                    <el-form-item prop="password">
                        <el-input type="password" v-model="walletPass.password" :placeholder="$t('common.passwordholder')">
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="repassword">
                        <el-input type="password" v-model="walletPass.repassword" :placeholder="$t('common.confirmholder')">
                        </el-input>
                    </el-form-item>
                </el-form>
                <div class="action-area">
                    <el-button type="primary" @click="generate()">{{ $t('encryption.generate') }}</el-button>
                </div>
            </div>
        </el-card>
        <el-card v-else-if="showPage === 'successPage'">
            <div class='main-area'>
                <div class="desc">
                    <span v-html="$t('encryption.created')"></span>
                </div>

                <div class="account">
                    <img class="avatar" :src="avatarUrl(newWallet.address)">
                    <div class="info">
                        <div>{{ newWallet.name }}</div>
                        <div :title="newWallet.address">0x{{newWallet.address}}</div>
                    </div>
                </div>
                <div class="action-area">
                    <el-button type="primary" @click="backToWallet()">{{ $t('encryption.confirm') }}</el-button>
                </div>
            </div>
        </el-card>

    </div>
</template>

<script>
import { getEncryptionKey, saveEncryptionKey } from '../utils/dbUtil'
import router from '../router'
import { Storj, mnemonicCheck, mnemonicGenerate } from '../utils/storjApiClient'
import walletManager from '../../wallet/walletManager'

export default {
    name: 'encryption-key',
    data: function () {
        return {
            showPage: 'newOrReturn',
            newWallet: {
                address: '',
                name: '',
            },
            encryptionKey: '',
            keyConfirm: '',
            walletPass: {
                password: '',
                repassword: '',
            },
            ruleInline: {
                password: [
                    { required: true, message: this.$t("common.inputpwd"), trigger: 'blur' },
                    { type: 'string', min: 6, message: this.$t("common.pwdlength"), trigger: 'blur' }
                ],
                repassword: [
                    {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value === '') {
                                callback(new Error(this.$t('common.inputpwdagain')));
                            } else if (value !== this.walletPass.password) {
                                callback(new Error(this.$t('common.pwdmismatch')));
                            } else {
                                callback();
                            }
                        },
                    }
                ]
            }
        }
    },
    methods: {
        checkKeyOkAndContinue() {
            getEncryptionKey(bridgePass).then((encryptionKey) => {
                if (encryptionKey) {
                    Storj.init({ bridgeUser, bridgePass, encryptionKey });
                    router.push({ path: '/index' });
                } else {
                    console.log('no key found');
                }
            })
        },
        async generateWallet(mnemonic, password) {
            // generate an HD wallet
            walletManager.importFromMnemonic(mnemonic, password).then(wallet => {
                wallet;
                this.newWallet.address = wallet.address;
                this.newWallet.name = wallet.name;
                this.showPage = "successPage";
            }).catch(e => {
                this.$message.error(this.$t('encryption.generrmsg', { errmsg: e.message || e }))
            })
        },
        confirm() {
            const valid = mnemonicCheck(this.encryptionKey)
            if (valid) {
                this.showPage = "setPassword";
                //this.generateWallet(this.encryptionKey, pwd)
            } else {
                console.error('bad key')
                this.$message.error(this.$t('encryption.invalidkey'))
            }
        },
        regenKey() {
            this.showPage = 'generate'
        },
        gotoConfirmMatch() {
            this.showPage = 'confirm'
        },
        gotoGenerate() {
            this.randomKey()
            this.showPage = 'generate'
        },
        gotoInput() {
            this.encryptionKey = ''
            this.showPage = 'inputKey'
        },
        gotoNewOrReturn() {
            this.encryptionKey = "";
            this.keyConfirm = "";
            this.walletPass.password = "";
            this.walletPass.repassword = "";
            this.newWallet.address = "";
            this.showPage = 'newOrReturn';
        },
        validateKeyMatchAndSubmit() {
            if (this.keyConfirm === this.encryptionKey) {
                this.showPage = "setPassword";
                //this.generateWallet(this.encryptionKey, pwd)
            } else {
                this.$message.error(this.$t('encryption.keymismatch'));
            }
        },
        submitLogin() {
            saveEncryptionKey(this.encryptionKey, pwd).then(() => {
                this.checkKeyOkAndContinue();
            }).catch((e) => {
                console.error(e)
            })
        },
        randomKey() {
            this.encryptionKey = mnemonicGenerate(128)
        },
        saveKey() {
            const theKey = this.encryptionKey
            const { dialog } = require('electron').remote
            dialog.showSaveDialog({
                title: 'Save Key',
                defaultPath: './key'
            }, (path) => {
                if (path != undefined && path.length > 0) {
                    var fs = require('fs');
                    fs.writeFile(path, theKey, err => {
                        if (err) {
                            return console.log(err);
                        }
                        console.log(this.$t('encryption.savekey'));
                    });
                }
            })
        },
        copyKey() {
            const { clipboard } = require('electron')
            clipboard.writeText(this.encryptionKey)
        },
        avatarUrl(id) {
            return "avatar://" + id;
        },
        async generate() {
            let validate = await this.$refs["walletPassword"].validate(async validate => {
                if (!validate) return;
                await this.generateWallet(this.encryptionKey, this.walletPass.password);
            });
        },
        backToWallet() {
            this.$store.dispatch("walletListInit");
            this.$router.push("/wallet-manager");
        }
    }
}
</script> 