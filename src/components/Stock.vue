<template>
  <div class='com-container'>
    <div ref='stock_ref' class='com-chart'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'StockPager',
  data () {
    return {
      chartInstance: null,// 初始化
      allData: null,// 服务器获取的数据
      currentIndex: 0,
      timerTd: null,
      titleFontSize: 0
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock'
    })
  },
  created () {
    this.$socket.registerCallBack('stockData', this.getData)
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerTd)
    this.$socket.unRegisterCallBack('stockData')
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
  methods: {
    // 初始化echarts图标的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      const centerPointers = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const initOption = {
        title: {
          text: '▎ 库存销售量',
          left: 20,
          top: 20
        },
        series: [
          {
            type: 'pie',
            center: centerPointers[0],
            hoverAnimation: false,
            label: {
              show: true,
              position: 'center'
            },
            labelLine: {
              show: false
            }
          },
          {
            type: 'pie',
            center: centerPointers[2],
            hoverAnimation: false,
            label: {
              show: true,
              position: 'center'
            },
            labelLine: {
              show: false
            }
          },
          {
            type: 'pie',
            center: centerPointers[3],
            hoverAnimation: false,
            label: {
              show: true,
              position: 'center'
            },
            labelLine: {
              show: false
            }
          },
          {
            type: 'pie',
            center: centerPointers[4],
            hoverAnimation: false,
            label: {
              show: true,
              position: 'center'
            },
            labelLine: {
              show: false
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerTd)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // http请求获取
    async getData () {
      const { data } = await this.$http.get('stock')
      this.allData = data
      this.updateChart()// 调用updataChart方法
      this.startInterval()
    },
    startInterval () {
      if (this.timerTd) {
        clearInterval(this.timerTd)
      }
      this.timerTd = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 3000)
    },
    // 处理数据
    updateChart () {
      const centerPointers = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArrs = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          center: centerPointers[index],
          radius: [110, 100],
          //  设置label显示的位置
          label: {
            show: true,
            position: 'center',
            color: colorArrs[index][0]
          },
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArrs[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArrs[index][0]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            },
          ],
          // 鼠标移入动画移除
          hoverAnimation: false,
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 对屏幕大小的调节
    screenAdapter () {
      this.titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      const innerRadius = this.titleFontSize * 2.8
      const outterRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        series: [

          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    }
  }
}
</script>

<style scoped>

</style>
