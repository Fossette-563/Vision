<template>
  <div class="com-container" @click="revertMap">
    <div ref="map_ref" class="com-chart"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
import { mapState } from 'vuex'

export default {
  name: 'Map',
  data () {
    return {
      chartInstance: null,
      allData: null,
      mapDta: {}// 所获取省份的地图矢量图模板
    }
  },
  mounted () {
    this.initChart()
    // this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
    this.getScatterData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map'
    })
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
  created () {
    this.$socket.registerCallBack('mapData', this.getData)
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('mapData')
  },
  methods: {
    // 显示地图
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      const { data: mapData } = await axios.get('http://localhost:9999/static/map/china.json')
      this.$echarts.registerMap('china', mapData)
      const initOption = {
        title: {
          text: '︱商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2E72BF',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      //  点击地图板块出现所点击地图
      this.chartInstance.on('click', async arg => {
        console.log(arg)
        const provinceInfo = getProvinceMapInfo(arg.name)
        console.log(provinceInfo, 'name')
        const { data } = await axios.get('http://localhost:9999' + provinceInfo.path)
        this.mapDta[provinceInfo.key] = data
        this.$echarts.registerMap(provinceInfo.key, data)
        this.chartInstance.setOption({
          geo: {
            map: provinceInfo.key
          }
        })
      })
      this.getScatterData()
    },
    // 回到中国地图
    revertMap () {
      this.chartInstance.setOption({
        geo: {
          map: 'china'
        }
      })
    },
    // 显示散点图
    async getScatterData () {
      const { data } = await this.$http.get('map')
      console.log(data, 'data')
      this.allData = data
      console.log(this.allData, 'allData')
      this.updateChart()
    },
    // getData () {
    //   this.updateChart()
    // },
    // 处理数据
    updateChart () {
      const lengendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        return {
          type: 'effectScatter',
          rippleEffect: {
            scale: 5,
            brushType: 'stroke'
          },
          coordinateSystem: 'geo',
          name: item.name,
          data: item.children
        }
      })
      const dataOption = {
        legend: {
          data: lengendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 屏幕自适应
    screenAdapter () {
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontsize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontsize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    }
  }
}
</script>

<style scoped>

</style>
