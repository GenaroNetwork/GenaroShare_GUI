<template>
    <div>
        <div class="layout-header">
            <p class="title" id="title">My Drives</p>
            <Poptip placement="bottom-end" v-model="pop_visible">
                <Button type="primary" class="button1">+ Add Drive</Button>
                <div slot="content">
                    <h3>Drive Location</h3>
                    <p class="input-style" @click="selectFile">{{file_path}}</p>
                    <h3 style="margin-top:20px">Sharing Size</h3>
                    <Input v-model="share_size">
                    <Select v-model="select_unit" slot="append" style="width: 60px;">
                        <Option value="MB" class="drop-down">MB</Option>
                        <Option value="GB" class="drop-down">GB</Option>
                        <Option value="TB" class="drop-down">TB</Option>
                    </Select>
                    </Input>
                    <div style="margin-top:45px">
                        <Button class="button2" @click="cancelShare">Cancel</Button>
                        <Button type="primary" class="button2" @click="addShare">Next</Button>
                    </div>
                </div>
            </Poptip>
        </div>
        <Table border ref="selection" :columns="columns4" :data="data1" :no-data-text="no_data"></Table>
    </div>
</template>
<style>
    .layout-header {
        height:70px;
    }
    .input-style {
        width:200px;
        height:33px;
        line-height:32px;
        line-width:200px;
        padding-left:8px;
        padding-right:8px;
        text-overflow:ellipsis;
        overflow: hidden;
        border-radius:4px;
        border:1px solid #DDDEE1;
    }
    .drop-down {
        height:20px;
        line-height:7px;
    }
    .title {
        font-size: 25px;
        font-weight: bold;
        float:left;
        margin-left:20px;
        width:85%;
        margin-top:10px;
    }
    .button1 {
        margin-left:title.width;
        margin-top:15px;
    }
    .button2 {
        width:49%;
    }


</style>
<script>
    import share from "../share/share.js"
    const {dialog} = require('electron').remote

    export default {
        data () {
            return {
                columns4: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: 'Drive ID',
                        render: (h, params) => {
                            return h('p', {
                                   style: {
                                       overflow: 'hidden',
                                       'white-space': 'nowrap',
                                       'text-overflow': 'ellipsis',
                                       'font-size': '15px'
                                   }
                                }, params.row.id);
                        }
                    },
                    {
                        title: 'Location',
                        render: (h, params) => {
                            return h('p', {
                                   style: {
                                       overflow: 'hidden',
                                       'white-space': 'nowrap',
                                       'text-overflow': 'ellipsis',
                                       'font-size': '15px'
                                   }
                                }, params.row.location);
                        }
                    },
                    {
                        title: 'Shared',
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Progress', {
                                   props: {
                                        percent: params.row.percentUsed,
                                        'hide-info': ''
                                   },
                                   styles: {
                                       'font-size': '12px'
                                   }
                                }),
                                h('p', params.row.spaceUsed + '/' + params.row.storageAllocation)
                            ]);
                        }
                    },
                    {
                        title: 'Uptime',
                        render: (h, params) => {
                            return h('p', {
                                   style: {
                                       'font-size': '15px'
                                   }
                                }, params.row.time);
                        }
                    },
                    {
                        title: 'Peers',
                        render: (h, params) => {
                            return h('p', {
                                   style: {
                                       'font-size': '15px'
                                   }
                                }, params.row.peers);
                        }
                    },
                    {
                        title: 'Allocs',
                        render: (h, params) => {
                            return h('p', {
                                   style: {
                                       'font-size': '15px'
                                   }
                                }, params.row.allocs);
                        }
                    },
                    {
                        title: 'Bridges',
                        render: (h, params) => {
                            return h('div', [
                                h('div', {
                                    style: {
                                        'border-radius' : '50%',
                                        'background-color': params.row.bridgesColor,
                                        width : '10px',
                                        height: '10px',
                                        float: 'left',
                                        'margin-top': '5px'
                                    }
                                }),
                                h('p', {
                                   style: {
                                       'font-size': '13px',
                                       'margin-left': '15px'
                                   }
                                }, params.row.bridgesText)
                            ]);
                        }
                    },
                    {
                        title: 'Status',
                        render: (h, params) => {
                            return h('div', [
                                h('i-switch', {
                                   props: {
                                       value: params.row.statusSwitch,
                                   },
                                   style: {
                                        float: 'left',
                                        'margin-top': '3px'
                                   }
                                }),
                                h('Poptip', {
                                    props: {
                                       placement: 'bottom-end',
                                       'v-model': 'pop_visible1'
                                    },
                                }, [
                                    h('span',{
                                        style: {
                                            'margin-left': '15px'
                                        },
                                        on : {
                                            click:() => {
                                               this.pop_visible1 = true;
                                               setInterval(() => {
                                                    this.pop_visible1 = false;
                                               }, 5000)
                                            }
                                        }
                                    },[
                                        h('Icon', {
                                            props: {
                                               type : 'more',
                                               size: '30'
                                            }
                                        })
                                    ]),
                                    h('div', {
                                        slot: 'content'
                                    }, [
                                        h('div', {
                                            style : {
                                                'font-size': '15px',
                                                'width' : '50px'
                                            },
                                            on : {
                                                click:() => {
                                                   this.pop_visible1 = false;
                                                   this.restartShare(params.row.id);
                                                }
                                            }
                                        }, 'restart'),
                                        h('div', {
                                           style : {
                                                'font-size': '15px',
                                                'margin-top': '10px'
                                           },
                                           on : {
                                                click:() => {
                                                   this.pop_visible1 = false;
                                                   this.stopShare(params.row.id);
                                                }
                                           }
                                        }, 'stop'),
                                        h('div', {
                                           style : {
                                                'font-size': '15px',
                                                'margin-top': '10px'
                                           },
                                           on : {
                                                click:() => {
                                                   this.pop_visible1 = false;
                                                   this.deleteShare(params.row.id, params.row.shareBasePath);
                                                }
                                           }
                                        }, 'delete')
                                    ])
                                ])


                            ]);
                        }
                    }
                ],
                data1: [],
                no_data:"You have not shared storage space, hurry up and share it ...",
                select_unit: "GB",
                share_size: '1',
                file_path: '请选择分享目录',
                pop_visible: false,
                pop_visible1: false
            }
        },
        created() {
            var that = this;
            share.showStatus(function(err, datas){
                if (that.pop_visible1) return;
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
                        that.file_path = '请选择分享目录';
                        return;
                    }
                    that.file_path = res;
                });
            },
            addShare() {
                share.addNewConfig(this.share_size, this.select_unit, this.file_path);
                this.pop_visible = false;
            },
            cancelShare() {
                this.pop_visible = false;
            },
            deleteShare(id, shareBasePath) {
                share.deleteShare(id, shareBasePath);
            },
            restartShare(id) {
                share.restartShare(id);
            },
            stopShare(id) {
                share.stopShare(id);
            }

        }
    }


</script>
