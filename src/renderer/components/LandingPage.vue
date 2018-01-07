<template>
  <div id="wrapper">
    <h1>Welcome to Eden Share</h1>
    <div id="newconfig" v-if="!hasConfig">
      Add new share config:<br>
      How much GB storage you want to share? <br>
      <input type="number"  v-model="shareSize" placeholder="please specify a positive number"/> GB <br>
      <button v-on:click.prevent="addNewConfig()">Start my share</button>
    </div>
    <div id="status" v-if="hasConfig">
      <table>
        <tr>
          <td>share id</td>
          <td>{{ shareId }}</td>
        </tr>
        <tr>
          <td>status</td>
          <td>{{ status }}</td>
        </tr>
        <tr>
          <td>Bridge</td>
          <td>{{ bridges }}</td>
        </tr>
        <tr>
          <td>storage path</td>
          <td>{{ path }}</td>
        </tr>
        <tr>
          <td>uptime</td>
          <td>{{ uptimeReadable }}</td>
        </tr>
        <tr>
          <td>Restarts</td>
          <td>{{ restarts }}</td>
        </tr>
        <tr>
          <td>Peers</td>
          <td>{{ peers }}</td>
        </tr>
        <tr>
          <td>Allocs</td>
          <td>{{ allocs }}</td>
        </tr>
        <tr>
          <td>Delta</td>
          <td>{{ delta }}</td>
        </tr>
        <tr>
          <td>Listen Port</td>
          <td>{{ listenPort }}</td>
        </tr>
        <tr>
          <td>Connection Type</td>
          <td>{{ connectionType }}</td>
        </tr>
        <tr>
          <td>Contract Count</td>
          <td>{{ contractCount }}</td>
        </tr>
        <tr>
          <td>Data receivedCount</td>
          <td>{{ dataReceivedCount }}</td>
        </tr>
      </table>
      <br>
      <a v-on:click.prevent="start()" href="#">Start</a>
      <a v-on:click.prevent="stop()" href="#">Stop</a>
      <a v-on:click.prevent="restart()" href="#">Restart</a>
      <a v-on:click.prevent="destory()" href="#">Destory</a>
    </div>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import dnode from 'dnode'
  import { createConfig, hasConfig, removeConfig, startShare } from '../../lib/share'
  const prettyms = require('pretty-ms')

  var data = {
    shareId: '',
    path: '',
    status: '',
    storageAllocation: '',
    uptimeReadable: '',
    restarts: '',
    peers: '',
    contractCount: 0,
    dataReceivedCount: 0,
    delta: '',
    listenPort: '',
    connectionType: '',
    shared: '',
    bridges: '',
    allocs: '',
    rpc: {},
    hasConfig: false,
    shareSize: 0
  }
  export default {
    name: 'landing-page',
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      start () {
        this.restart()
      },
      stop () {
        this.rpc.stop(this.shareId, (err) => {
          if (err) {
            console.log(err)
          }
        })
      },
      restart () {
        this.rpc.restart(this.shareId, (err) => {
          if (err) {
            console.log(err)
          }
        })
      },
      destory () {
        this.rpc.destroy(this.shareId, (err) => {
          if (err) {
            console.log(err)
          } else {
            removeConfig()
            window.location.reload()
          }
        })
      },
      addNewConfig () {
        let size = parseInt(this.shareSize)
        if (size <= 0) {
          alert('please specify a negtive number')
          return
        }
        alert('You will share ' + this.shareSize + 'GB space of your device')
        let configPath = createConfig(this.shareSize)
        if (configPath) {
          startShare()
          this.hasConfig = true
          alert('Config created at ' + configPath + ', now starting service..')
          console.log(configPath)
          this.showStatus()
        }
      },
      showStatus () {
        let this2 = this
        dnode.connect(45015, (rpc) => {
          console.log('web connected 45015')
          this2.rpc = rpc
          function showData () {
            rpc.status((err, shares) => {
              if (shares.length === 0) {
                return
              }
              const share = shares[0]
              console.log(err)
              console.log(shares)
              data.path = share.config.storagePath
              data.storageAllocation = share.config.storageAllocation
              data.shareId = share.id
              data.status = (() => {
                if (share.state === 0) {
                  return 'Stopped'
                } else if (share.state === 1) {
                  return 'Running'
                } else if (share.state === 2) {
                  return 'Errored'
                }
              })()

              data.uptimeReadable = prettyms(share.meta.uptimeMs)

              data.restarts = share.meta.numRestarts
              data.peers = share.meta.farmerState.totalPeers
              data.delta = share.meta.farmerState.ntpStatus ? share.meta.farmerState.ntpStatus.delta : 9999
              data.listenPort = share.meta.farmerState.portStatus.listenPort
              data.connectionType = share.meta.farmerState.portStatus.connectionType
              data.contractCount = share.meta.farmerState.contractCount
              data.dataReceivedCount = share.meta.farmerState.dataReceivedCount
              data.shared = ''
              data.bridges = (() => {
                if (share.meta.farmerState.bridgesConnectionStatus === 0) {
                  return 'Disconnected'
                }
                if (share.meta.farmerState.bridgesConnectionStatus === 1) {
                  return 'Connecting'
                }
                if (share.meta.farmerState.bridgesConnectionStatus === 2) {
                  return 'Confirming'
                }
                if (share.meta.farmerState.bridgesConnectionStatus === 3) {
                  return 'Connected'
                }
              })()
              data.allocs = share.meta.farmerState.spaceUsed + '(' + share.meta.farmerState.percentUsed + '%)'
            })
          }
          setInterval(() => {
            showData()
          }, 3000)
        })
      },
      refresh () {
        if (hasConfig()) {
          this.hasConfig = true
          this.showStatus()
        } else {
          this.hasConfig = false
        }
      }
    },
    data () {
      return data
    },
    mounted: function () {
      var this2 = this
      this.$nextTick(function () {
        this2.refresh()
      })
    }
  }
</script>

<style>
</style>
