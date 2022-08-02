<template>
  <div class="com-container">
    <div :style="comStyle" class="title">
      <span style="cursor: pointer" @click="showChoice=!showChoice">{{ '|' + showTitle }}</span>
      <span :style="comStyle" class="iconfont title-icon" @click="showChoice=!showChoice">&#xe6eb;</span>
      <div v-for="item in selectTypes" v-show="showChoice" :key="item.key" class="select-con"
           @click="handleSelect(item.key)">
        <div class="select-item">{{ item.text }}</div>
      </div>
    </div>
    <div ref="trend_ref" class="com-chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'Trand',
  data () {
    return {
      chartInstance: null,// 初始化
      allData: null,// 服务器获取的数据
      showChoice: false,// 是否显示可选项
      choicesType: 'map',
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
      socketType: 'trendData',
      chartName: 'trend'
    })
  },
  created () {
    this.$socket.registerCallBack('trendData', this.getData)
  },
  destroyed () {
    window.removeEventListener('resize', this, screenAdapter)
    this.$socket.unRegisterCallBack('trendData')
  },
  computed: {
    ...mapState(['theme']),
    marginStyle () {
      return {
        marginLeft: this.titleFontSize + 'px',
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    },
    selectTypes () {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter(item => {
          return item.key !== this.choicesType
        })
      }
    },
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choicesType].title
      }
    },
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
  },
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
      console.log(this.theme, ' this.theme11')
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true
        },
        // 提示
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          // 紧挨边缘
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // http请求获取
    async getData () {
      const { data } = await this.$http.get('trend')
      this.allData = data
      console.log(this.allData)
      this.updateChart()// 调用updataChart方法
    },
    // 处理数据
    updateChart () {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 处理数据
      // 类目轴数据
      const timeArr = this.allData.common.month
      // y轴数据
      const valueArr = this.allData[this.choicesType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.choicesType,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index],
              },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      // 图例数据
      const legendArr = valueArr.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 对屏幕大小的调节
    screenAdapter () {
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontsize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    handleSelect (currentType) {
      this.choicesType = currentType
      this.updateChart()
      this.showChoice = false
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-con {
    background-color: #222733;
  }

  .select-item {
    cursor: pointer;
  }
}
</style>
