import dnode from 'dnode'
import { createConfig, removeConfig, startShare } from '../../../lib/share'
const prettyms = require('pretty-ms')

let RPC;

class Share {


    constructor() {
        this.confuse = false;
    };
    showStatus(cb) {
        dnode.connect(45015, rpc => {
            console.log('web connected 45015');
            this.rpc = rpc;
            this.showData(cb);
            setInterval(() => {
                this.showData(cb)
            }, 2000);
        });
    };
    showData(cb) {
        this.rpc.status((err, shares) => {
            if (err || this.confuse) return;
            if (shares.length === 0) return;
            let datas = [];
            let connectId = "";
            for (let share of shares) {
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
                data.allocs = data.contractCount + '(' + data.dataReceivedCount + 'received)';
                data.bridges = share.meta.farmerState.bridgesConnectionStatus;
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

            }
            cb(null, datas, connectId);

        })
    };

    addNewConfig(shareSize, shareUnit, shareBasePath) {
        let size = parseInt(shareSize);
        if (size <= 0) {
            alert('please specify a negtive number');
            return
        }
        let configPath = createConfig(shareSize, shareUnit, shareBasePath);
        if (configPath) {
            try {
                this.confuse = true;
                this.rpc.start(configPath, err => {
                    this.confuse = false;
                    if (err) alert(err.message)
                });
            } catch (err) {
                console.log(err)
            }
        }
    };
    deleteShare(id, shareBasePath) {
        this.confuse = true;
        this.rpc.destroy(id, err => {
            this.confuse = false;
            if (err) {
                alert(err.message)
            } else {
                removeConfig(shareBasePath);
                window.location.reload();
            }
        })
    };
    restartShare(id) {
        this.confuse = true;
        this.rpc.restart(id, err => {
            this.confuse = false;
            if (err) {
                alert(err.message)
            }
        })
    };
    stopShare(id) {
        this.confuse = true;
        this.rpc.stop(id, err => {
            this.confuse = false;
            if (err) {
                alert(err.message)
            }
        })
    };
}

/*

if (false) Share.prototype.confuse = false;
if (true) Share.prototype = {
    constructor: Share,
    showStatus: (cb) => {
        var that = this;
        dnode.connect(45015, (rpc) => {
            console.log('web connected 45015')
            this.rpc = rpc;
            function showData() {
                rpc.status((err, shares) => {
                    if (err || that.confuse) {
                        return;
                    }
                    if (shares.length === 0) {
                        return;
                    }
                    var datas = new Array();
                    var connectId = "";
                    for (var share of shares) {
                        var data = new Object();
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
                        data.allocs = data.contractCount + '(' + data.dataReceivedCount + 'received)';
                        data.bridges = share.meta.farmerState.bridgesConnectionStatus;
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

                    }
                    cb(null, datas, connectId);

                })
            }
            setInterval(() => {
                showData()
            }, 2000)
        })
    },
    addNewConfig: (shareSize, shareUnit, shareBasePath) => {
        let size = parseInt(shareSize);
        if (size <= 0) {
            alert('please specify a negtive number');
            return
        }
        let configPath = createConfig(shareSize, shareUnit, shareBasePath);
        if (configPath) {
            try {
                this.confuse = true;
                var that = this;
                this.rpc.start(configPath, (err) => {
                    that.confuse = false;
                    if (err) {
                        alert(err.message)
                    }
                })
            } catch (err) {
                console.log(err)
            }
        }
    },
    deleteShare: (id, shareBasePath) => {
        this.confuse = true;
        var that = this;
        this.rpc.destroy(id, (err) => {
            that.confuse = false;
            if (err) {
                alert(err.message)
            } else {
                removeConfig(shareBasePath);
                window.location.reload();
            }
        })
    },
    restartShare: (id) => {
        this.confuse = true;
        var that = this;
        this.rpc.restart(id, (err) => {
            that.confuse = false;
            if (err) {
                alert(err.message)
            }
        })
    },
    stopShare: (id) => {
        this.confuse = true;
        var that = this;
        this.rpc.stop(id, (err) => {
            that.confuse = false;
            if (err) {
                alert(err.message)
            }
        })
    }
};
*/
export default Share;

