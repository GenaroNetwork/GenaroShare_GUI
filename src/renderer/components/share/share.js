import dnode from 'dnode'
import { createConfig, removeConfig, startShare } from '../../../lib/share'
const prettyms = require('pretty-ms')

function Share() {

}

Share.prototype = {
    constructor:Share,
    showStatus: (cb) => {
        dnode.connect(45015, (rpc) => {
            console.log('web connected 45015')
            this.rpc = rpc;
            function showData () {
                rpc.status((err, shares) => {
                    if (err) {
                        return;
                    }
                    if (shares.length === 0) {
                        return;
                    }
                    var datas = new Array();
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
                        switch(data.status) {
                            case 0:
                                data.statusSwitch = false;
                                break;
                            case 1:
                                data.statusSwitch = true;
                                break;
                            case 2:
                                data.statusSwitch = false;
                                break;
                        }
                        data.delta = share.meta.farmerState.ntpStatus ? share.meta.farmerState.ntpStatus.delta : 9999;
                        // data.listenPort = share.meta.farmerState.portStatus.listenPort;

                        datas.push(data);

                    }
                    cb(null, datas);

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
            startShare(configPath);
        }
    },
    deleteShare: (id, shareBasePath) => {
        this.rpc.destroy(id, (err) => {
            if (err) {
                alert(err)
            } else {
                removeConfig(shareBasePath);
                window.location.reload();
            }
        })
    },
    restartShare: (id) => {
        this.rpc.restart(id, (err) => {
            if (err) {
                alert(err)
            }
        })
    },
    stopShare: (id) => {
        this.rpc.stop(id, (err) => {
            if (err) {
                alert(err)
            }
        })
    }
};

export default new Share();

