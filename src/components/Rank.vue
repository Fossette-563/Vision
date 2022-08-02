<template>
  <div class='com-container'>
    <div ref='rank_ref' class='com-chart'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Rank',
  data () {
    return {
      chartInstance: null,// 初始化
      allData: null,// 服务器获取的数据
      startValue: 0,
      endValue: 9,
      timerId: null
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
      socketType: 'rankData',
      chartName: 'rank'
    })
  },
  created () {
    this.$socket.registerCallBack('rankData', this.getData)
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)// 组件销毁停止定时器
    this.$socket.unRegisterCallBack('rankData')
  },
  methods: {
    // 初始化echarts图标的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
      const initOption = {
        title: {
          text: '︱地区销售排行',
          left: 20,
          top: 20,
        },
        grid: {
          top: '40%',
          left: '5%',
          bottom: '5%',
          right: '5%',
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }
      // 鼠标移入停止
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      // 鼠标离开启动
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // http请求获取
    async getData () {
      const { data } = await this.$http.get('rank')
      this.allData = data
      this.allData.sort((a, b) => {
        return b.value - a.value
      })
      this.updateChart()// 调用updataChart方法
      this.startInterval()// 启动定时器
    },
    // 处理数据
    updateChart () {
      const provinceArr = this.allData.map(item => {
        return item.name
      })
      const valueArr = this.allData.map(item => {
        return item.value
      })
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: arg => {
                let targetColorArr = colorArr[0]
                if (arg.value >= 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value >= 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 对屏幕大小的调节
    screenAdapter () {
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontsize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              // 圆角柱状图
              barBorderRadius: [0.5 * titleFontSize, 0.5 * titleFontSize, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    startInterval () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 3000)
    }
  }
}
</script>

<style scoped>

</style>
