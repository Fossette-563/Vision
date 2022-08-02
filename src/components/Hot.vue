<template>
  <div class='com-container'>
    <div ref='hot_ref' class='com-chart'></div>
    <span :style="comStyle" class="iconfont arr_left" @click="toLeft">&#xe6ef;</span>
    <span :style="comStyle" class="iconfont arr_right" @click="toRight">&#xe6ed;</span>
    <span :style="comStyle" class="cat_name">{{ catTitle }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'HotPage',
  data () {
    return {
      chartInstance: null,// 初始化
      allData: null,// 服务器获取的数据
      currentIndex: 0,
      titleFontSize: 0,
    }
  },
  created () {
    this.$socket.registerCallBack('hotData', this.getData)
  },
  watch: {
    theme () {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  computed: {
    ...mapState(['theme']),
    catTitle () {
      if (!this.allData) {
        return ''
      }
      return this.allData[this.currentIndex].name
    },
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot'
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    // 初始化echarts图标的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        legend: {
          top: '5%',
          icon: 'circle'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const tipArray = []
            params.data.children.forEach(function (item) {
              const childStr = `${item.name}&nbsp;&nbsp;&nbsp;${parseInt((item.value / params.value) * 100) + '%'}`
              tipArray.push(childStr)
            })
            return tipArray.join('<br/>')
          },
        },
        title: {
          text: '｜热销商品销售金额占比统计',
          left: 20,
          top: 20
        },
        series: [
          {
            type: 'pie',
            label: { // 隐藏文字
              show: false
            },
            labelLine: { // 隐藏线
              show: false
            },
            emphasis: { // 高亮显示文字
              show: true
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    // http请求获取
    async getData () {
      const { data } = await this.$http.get('hot')
      this.allData = data
      console.log(this.allData, 'all')
      this.updateChart()// 调用updataChart方法
    },
    // 处理数据
    updateChart () {
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          value: item.value,
          name: item.name,
          children: item.children
        }
      })
      const legendData = this.allData[this.currentIndex].children.map(item => {
        return item.name
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 对屏幕大小的调节
    screenAdapter () {
      console.log('111')
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontsize: this.titleFontSize / 2
          }
        },
        title: {
          textStyle: {
            fontsize: this.titleFontSize
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ['50%', '60%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    //  点击事件
    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight () {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style lang="scss" scoped>
.arr_left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #fff;
}

.arr_right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #fff;
}

.cat_name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  font-weight: bold;
  color: #fff;
}
</style>
