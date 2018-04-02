import { web3, chainId, utils, GNXAddr, EMUAddr } from './web3Util'
import * as gnx from './gnxSmart'
import axios from 'axios'
import { BRIDGE_API_URL } from '../config'
const fs = require('fs')
const path = require('path')
const os = require('os')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Wallet = require('ethereumjs-wallet')
const hdkey = require('ethereumjs-wallet/hdkey')
const Tx = require('ethereumjs-tx')

const KEYCHAIN_WALLET = 'network.genaro.sharer.wallet'
const GXN_RATE = 10 ** 9

var isFirstTime = false
const dbFolder = path.join(os.homedir(), ".sharer")
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder)
    isFirstTime = true
}

const dbPath = path.join(dbFolder, "wallets.json")
const adapter = new FileSync(dbPath)
const db = low(adapter)

db.defaults({ wallet: [] }).write()

function generateWalletName() {
    const names = new Set();
    let dbs = db.get('wallet').value() || [];
    dbs.forEach(e => {
        names.add(e.name)
    });
    var i = 0;
    while (++i) {
        var tmpname = `Account ${i}`
        if (!names.has(tmpname)) {
            return tmpname
        }
    }
}
/*
  {
    name: 'wallet 1',
    created: 1321321,
    address: '009b5109f8f0ef4d360f10bd51358e76f042d1a1',
    source: 'imported' // derieved
  }
*/
async function updateWalletName({ address, name }) {
    db.get("wallet")
        .find({ address })
        .assign({ name })
        .write();
}

async function loadWallet() {
    return db.get('wallet').cloneDeep().sortBy(item => -item.created).value();
}

function loadFirstWallet() {
    const wallets = db.get('wallet').cloneDeep().sortBy(item => item.created).value()
    if (wallets && wallets[0]) {
        return wallets[0]
    } else {
        return null
    }
}

function loadWalletFromAddr(address) {
    const wallet = db.get('wallet').find({ address: address }).cloneDeep().value()
    if (wallet) return wallet
    return null;
}

async function loadRawWallet(address, password) {
    let v3str = JSON.stringify(db.get("wallet").find({ address }).value());
    return Wallet.fromV3(v3str, password);
}

async function validateWalletPassword(address, password) {
    try {
        const w = await loadRawWallet(address, password);
        return true;
    } catch (e) {
        throw new Error('incorrect password');
    }
}

async function exportV3Json(address) {
    let wjson = db.get("wallet").find({ address }).value()
    delete wjson.created // satisfy parity
    return JSON.stringify(wjson, null, 4);
}

async function saveWallet(wa, name, pass) {
    let v3 = wa.toV3(pass);
    const address = v3.address;
    const found = db.get('wallet').find({ address: address }).value();
    if (found) throw ({ code: 1, message: `address ${address} already exists. Please delete it first.` });
    v3.name = name;
    v3.created = Date.now();
    db.get('wallet').push(v3).write();
    return v3;
}

async function updateWalletPassword(wa, newPass) {
    const v3 = wa.toV3(newPass);
    const address = v3.address;
    const found = db.get('wallet').find({ address: address }).assign(v3).write();
}

async function importFromV3Json(json, password, name) {
    const jsonv3 = JSON.parse(json);
    name = name || jsonv3.name || generateWalletName();
    const w = Wallet.fromV3(json, password)
    await saveWallet(w, name, password)
}

async function importFromMnemonic(mnemonic, password) {
    // compatible with metamask/jaxx
    const bip39 = require('bip39');
    const seed = bip39.mnemonicToSeed(mnemonic);
    let wallet = hdkey.fromMasterSeed(seed).derivePath(`m/44'/60'/0'/0`).deriveChild(0).getWallet();

    //const ss = wallet.getAddress().toString()
    return await saveWallet(wallet, generateWalletName(), password);
}

function importFromPrivateKey() {
    // TODO:
}

async function deleteWallet(address) {
    db.get('wallet').remove({ address }).write();
}

async function clearWallets() {
    db.set('wallet', []).write();
}

async function changePassword(address, passoword, newPassword) {
    const w = await loadRawWallet(address, passoword)
    await updateWalletPassword(w, newPassword)
}

function initRawWallet(v3, pass) {
    return Wallet.fromV3(v3, pass)
}

async function generateSignedTx(myAddr, password, receiveAddr, amount, gas, gasLimit) {
    const myWallet = db.get('wallet').find({ address: myAddr }).value()
    if (!myWallet) throw ('wallet not found');
    const rawWallet = await loadRawWallet(myAddr, password)
    const prikBuf = rawWallet.getPrivateKey()
    const nonceval = await web3.eth.getTransactionCount(myAddr)

    if (web3.currentProvider.connected !== true) {
        throw ('web3 not ready')
    } else {
        console.log('ready')
    }

    const weiAmount = utils.toWei(amount, 'ether') // TODO: Please pass numbers as strings or BigNumber objects to avoid precision errors 
    // 1. make transaction data
    let txOptions = {
        gasPrice: web3.utils.toHex(parseInt(gas)),
        gasLimit: web3.utils.toHex(gasLimit),
        value: web3.utils.toHex(weiAmount),
        nonce: web3.utils.toHex(nonceval),
        from: myAddr,
        to: receiveAddr,
        chainId
    }

    var tx = new Tx(txOptions)
    // 2. sign transaction
    tx.sign(prikBuf)
    var serializedTx = tx.serialize()
    const rawTrans = '0x' + serializedTx.toString('hex')
    console.log(txOptions)
    return rawTrans
}

async function generateSignedGnxTx(myAddr, password, receiveAddr, amount, gas, gasLimit) {
    const myWallet = db.get('wallet').find({ address: myAddr }).value()
    if (!myWallet) throw ('wallet not found')
    const rawWallet = await loadRawWallet(myAddr, password)
    const prikBuf = rawWallet.getPrivateKey()
    const nonceval = await web3.eth.getTransactionCount(myAddr)

    if (web3.currentProvider.connected !== true) {
        throw ('web3 not ready')
    } else {
        console.log('ready')
    }

    // 1. make transaction data
    let txOptions = {
        gasPrice: web3.utils.toHex(parseInt(gas)),
        gasLimit: web3.utils.toHex(gasLimit),
        value: 0,
        nonce: web3.utils.toHex(nonceval),
        from: myAddr,
        to: GNXAddr,
        data: gnx.getTransferData(receiveAddr, amount * GXN_RATE),
        chainId
    }

    var tx = new Tx(txOptions)
    // 2. sign transaction
    tx.sign(prikBuf)
    var serializedTx = tx.serialize()
    const rawTrans = '0x' + serializedTx.toString('hex')
    return rawTrans
}

async function generateSignedApproveTx(myAddr, password, amount, gas, gasLimit) {
    const myWallet = db.get('wallet').find({ address: myAddr }).value()
    if (!myWallet) throw ('wallet not found');
    const rawWallet = await loadRawWallet(myAddr, password)
    const prikBuf = rawWallet.getPrivateKey()
    const nonceval = await web3.eth.getTransactionCount(myAddr)

    // 1. make transaction data
    let txOptions = {
        gasPrice: web3.utils.toHex(parseInt(gas)),
        gasLimit: web3.utils.toHex(gasLimit),
        value: 0,
        nonce: web3.utils.toHex(nonceval),
        from: myAddr,
        to: GNXAddr,
        data: gnx.getApproveData(EMUAddr, amount * GXN_RATE),
        chainId
    }

    var tx = new Tx(txOptions)
    // 2. sign transaction
    tx.sign(prikBuf)
    var serializedTx = tx.serialize()
    const rawTrans = '0x' + serializedTx.toString('hex')
    return rawTrans;
}

export default {
    loadWallet,
    loadRawWallet,
    importFromV3Json,
    importFromMnemonic,
    initRawWallet,
    generateSignedTx,
    generateSignedGnxTx,
    generateSignedApproveTx,
    deleteWallet,
    changePassword,
    validateWalletPassword,
    exportV3Json,
    loadFirstWallet,
    loadWalletFromAddr,
    updateWalletName,
    clearWallets,
}
