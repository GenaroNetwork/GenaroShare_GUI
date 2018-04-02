import walletManager from '../../../wallet/walletManager'
import * as txManager from '../../../wallet/transactionManager'
import { getBalanceEth, getBalanceGnx } from '../../../wallet/transactionManager';
const Tx = require('ethereumjs-tx');

import { web3, GNXAddr, EMUAddr as EmuAddr, chainId } from "../../../wallet/web3Util";

const fs = require('fs');
const state = {
    wallets: [],
    balances: {
        eth: {},
        gnx: {},
    },
    currentWallet: null,
    paymentWallet: null,
}

const getters = {
    currentWallet(state) {
        let wallet = state.wallets.find(wallet => wallet.address === state.currentWallet);
        if (wallet) return wallet;
        if (state.wallets[0]) return state.wallets[0];
        return {};
    },
    currentWalletEth(state) {
        if (state.currentWallet) return state.balances.eth[state.currentWallet];
        if (state.wallets[0]) return state.balances.eth[state.wallets[0].address];
        return 0;
    },
    currentWalletGnx(state) {
        if (state.currentWallet) return state.balances.gnx[state.currentWallet];
        if (state.wallets[0]) return state.balances.gnx[state.wallets[0].address];
        return 0;
    },
    paymentWallet(state) {
        let wallet = state.wallets.find(wallet => wallet.address === state.paymentWallet);
        if (wallet) return wallet;
        return {};
    },
}

const mutations = {
    walletListUpdateName(state, { address, name }) {
        let newWallets = state.wallets.forEach(oldWallet => {
            if (oldWallet.address !== address) return true;
            oldWallet.name = name;
        });
    },
    walletListInit(state, wallets) {
        state.wallets = wallets
    },
    walletListUpdateBalance(state, { address, ETH, GNX }) {
        state.balances.gnx = Object.assign({}, state.balances.gnx, { [address]: GNX });
        state.balances.eth = Object.assign({}, state.balances.eth, { [address]: ETH });
    },
    walletListSetPayment(state, { address }) {
        state.paymentWallet = address;
    },
    walletListSetCurrent(state, { address }) {
        state.currentWallet = address;
    }
}

const actions = {
    async walletListInit({ commit, dispatch }) {
        let wallets = await walletManager.loadWallet();
        commit('walletListInit', wallets);
        dispatch("walletListInitBalances");
    },
    async walletListInitBalances({ commit }) {
        for (let wallet of state.wallets) {
            setTimeout(async () => {
                let address = wallet.address;
                let ETH = await getBalanceEth(address);
                let GNX = await getBalanceGnx(address);
                commit("walletListUpdateBalance", { address, ETH, GNX });
            }, 0);
        }
    },
    async walletListImportV3({ commit, dispatch }, { filePath, password }) {
        const content = fs.readFileSync(filePath, 'utf8')
        await walletManager.importFromV3Json(content, password)
        await dispatch('walletListInit')
    },
    async walletListDelete({ commit, dispatch }, { address, password }) {
        const passwordOk = await walletManager.validateWalletPassword(address, password)
        if (passwordOk) {
            const ok = await walletManager.deleteWallet(address)
            await dispatch('walletListInit')
        }
    },
    async walletListChangePassword({ commit, dispatch }, { address, password, newPassword }) {
        await walletManager.changePassword(address, password, newPassword)
        await dispatch('walletListInit')
    },
    async walletListSetPayment({ commit, dispatch, rootState }, { address, password, option, nodeId, quantity }) {
        function hex8(val) {
            val &= 0xFF;
            var hex = val.toString(16).toUpperCase();
            return ("00" + hex).slice(-1);
        }

        function toUTF8Array(str) {
            var utf8 = [];
            for (var i = 0; i < str.length; i++) {
                var charcode = str.charCodeAt(i);
                if (charcode < 0x80) utf8.push(charcode);
                else if (charcode < 0x800) {
                    utf8.push(0xc0 | (charcode >> 6),
                        0x80 | (charcode & 0x3f));
                }
                else if (charcode < 0xd800 || charcode >= 0xe000) {
                    utf8.push(0xe0 | (charcode >> 12),
                        0x80 | ((charcode >> 6) & 0x3f),
                        0x80 | (charcode & 0x3f));
                }
                // surrogate pair
                else {
                    i++;
                    // UTF-16 encodes 0x10000-0x10FFFF by
                    // subtracting 0x10000 and splitting the
                    // 20 bits of 0x0-0xFFFFF into two halves
                    charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                        | (str.charCodeAt(i) & 0x3ff));
                    utf8.push(0xf0 | (charcode >> 18),
                        0x80 | ((charcode >> 12) & 0x3f),
                        0x80 | ((charcode >> 6) & 0x3f),
                        0x80 | (charcode & 0x3f));
                }
            }
            return utf8;
        }
        // set the provider you want from Web3.providers
        let gasPrice = await web3.eth.getGasPrice();
        gasPrice = gasPrice < 4e9 ? 4e9 : gasPrice;
        let wallet = await walletManager.loadRawWallet(address, password);
        let GNX = require("../../../wallet/GNX.json");
        let abi = GNX.abi;

        let Contract = new web3.eth.Contract(abi, GNXAddr)
        if (web3.currentProvider.connected !== true)
            console.log('not ready yet, please try again')
        else
            console.log('starting in seconds...')
        // var _str = '0x'+hex8(genaroshare_stake.option)+genaroshare_stake.nodeID;
        let _str = hex8(option) + nodeId;
        let _buffer = toUTF8Array(_str);
        let _newstr = web3.utils.bytesToHex(_buffer);
        let nonceval = await web3.eth.getTransactionCount(address);

        let txOptions = {
            gasPrice: web3.utils.toHex(parseInt(gasPrice)),
            gasLimit: web3.utils.toHex(470000),
            value: 0,
            nonce: web3.utils.toHex(nonceval),
            from: address,
            to: GNXAddr,
            data: Contract.methods.approveAndCall(EmuAddr, quantity * 10 ** 9, _newstr).encodeABI(),
            chainId
        }
        // key should be the one from genaro stake stakebase
        var privateKey = wallet._privKey;
        var tx = new Tx(txOptions);
        tx.sign(privateKey);
        var serializedTx = tx.serialize();
        console.log(serializedTx.toString('hex'));

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
            if (err) { console.log(err); return; }

            console.log('stake tx hash: ' + hash);
        });
    },
    async walletListUpdateName({ commit }, { address, name }) {
        await walletManager.updateWalletName({ address, name });
        commit("walletListUpdateName", { address, name });
    },
    async walletListSetCurrent({ commit, dispatch }, { address }) {
        commit("walletListSetCurrent", { address });
        dispatch("walletListUpdateCurrentBalance");
    },
    async walletListUpdateCurrentBalance({ commit }) {
        let ETH = await getBalanceEth(state.currentWallet);
        let GNX = await getBalanceGnx(state.currentWallet);
        commit('walletListUpdateBalance', { address: state.currentWallet, ETH, GNX });
    },
    async walletListPayByCurrent({ commit, state, getters, rootState, dispatch }, payOption) {
        let rawTransaction
        if (payOption.payType === 'ETH') {
            rawTransaction = await walletManager.generateSignedTx(state.currentWallet, payOption.password, payOption.recipient, payOption.amount, payOption.gasPrice, payOption.gasLimit)
        } else if (payOption.payType === 'GNX') {
            rawTransaction = await walletManager.generateSignedGnxTx(state.currentWallet, payOption.password, payOption.recipient, payOption.amount, payOption.gasPrice, payOption.gasLimit)
        }

        payOption.from = state.currentWallet;
        delete payOption.password;
        dispatch('submitTransaction', { payOption, rawTransaction }, { root: true })
    },
}

export default {
    state,
    getters,
    mutations,
    actions
}