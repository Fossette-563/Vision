export default class SocketService {
  /**
   * 单例
   */
  static instance = null
  static get Instance () {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null

  // 存储回调函数
  callBackMapping = {}
  /** * socketType * trendData sellerData mapData rankData hotData stockData * fullScreen * themeChange * callBack * 回调函数 */
  registerCallBack (socketType, callBack) {
    // 往 callBackMap中存放回调函数
    this.callBackMapping[socketType] = callBack
  }

  unRegisterCallBack (socketType) {
    this.callBackMapping[socketType] = null
  }

  // 标识是否连接成功
  connected = false

  // 记录重试的次数
  sendRetryCount = 0

  // 重新连接尝试的次数
  connectRetryCount = 0

  //  定义连接服务器的方法
  connect () {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持 WebSocket!')
    }
    this.ws = new WebSocket('ws://localhost:9998') // 监听连接成功
    this.ws.onopen = () => {
      console.log('WebSocket 连接成功')
      this.connectRetryCount = 0 // 连接成功之后, 重置重连次数
      this.connected = true
    }// 1.服务器连接不成功 2.服务器关闭了连接
    this.ws.onclose = () => {
      console.log('服务器关闭了连接')
      setTimeout(() => {
        this.connectRetryCount++
        this.connect()
      }, 200 * this.connectRetryCount)
    }// 监听接收消息
    this.ws.onmessage = msg => {
      console.log('wedSocket 接收到数据')
      const revData = JSON.parse(msg.data)
      const socketType = revData.socketType
      if (this.callBackMapping[socketType]) {
        if (revData.action === 'getData') {
          const realData = revData.data
          this.callBackMapping[socketType].call(this,JSON.parse(realData))
        }
      }
    }
  }

  send (data) {
    console.log('发送数据给服务器')
    if (this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      setTimeout(() => {
        this.sendRetryCount++
        this.send(data)
      },200 * this.sendRetryCount)
    }
  }
}
