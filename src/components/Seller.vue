<template>
<div class="com-container">
  <div class="com-chart" ref="seller_ref"></div>
</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Seller',
  data () {
    return {
      chartInstance: null,
      allData: [],
      currentPage: 1, // 当前是第几页
      totalPage: 0, // 一共有多少页
      timerId: null// 定时器标识
    }
  },
  computed: { ...mapState(['theme']) },
  watch: {
    theme () {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller'
    })
  },
  created () {
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  destroyed () {
    clearInterval(this.timerId)
    // 在组件销毁时，将监听器取消掉
    window.removeEventListener('resize',this.screenAdapter)
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    // 初始化echartsInstancs对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      const initOption = {
        // 不包含坐标轴
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true// 距离是否包含坐标轴中的文字
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 指明颜色渐变方向
              // 指明不用百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                },
              ])
            }
          }
        ],
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    async getData () {
      const { data } = await this.$http.get('seller')
      this.allData = data
      // 对数组进行排序
      this.allData.sort((a, b) => {
        return a.value - b.value
      })
      // 每5个元素显示一页
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      // 调用更新图表
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },
    //  更新图表
    updateChart () {
      // 开始索引
      const start = (this.currentPage - 1) * 5
      // 结束索引
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      const sellerValues = showData.map((item) => {
        return item.value
      })
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },
        series: [
          {
            data: sellerValues,
          }
        ],
      }
      this.chartInstance.setOption(dataOption)
    },
    // 图标动态更新
    startInterval () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 屏幕适配，当浏览器大小发生变化的时候，会调用的方法，来完成屏幕的适配
    screenAdapter () {
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的配置项
      const adapterOption = {
        title: {
          text: '︳商家销售统计',
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            z: 0,
            lineStyle: {
              width: titleFontSize,
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            }
          }
        ],
      }
      this.chartInstance.setOption(adapterOption)
      //  手动调用图标对象的resize才能产生效果
      this.chartInstance.resize()
    },
  }
}
</script>

<style scoped>

</style>
