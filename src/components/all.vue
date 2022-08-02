<template>
<!--  通用代码流程-->
  <div class="com-container">
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
export default {
  name: 'Trand',
  data () {
    return {
      chartInstance: null,// 初始化
      allData: null// 服务器获取的数据
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize',this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize',this.screenAdapter)
  },
  methods: {
    // 初始化echarts图标的方法
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref)
      const initOption = {}
      this.chartInstance.setOption(initOption)
    },
    // http请求获取
    getData () {
      this.updateChart()// 调用updataChart方法
    },
    // 处理数据
    updateChart () {
      const dataOption = {}
      this.chartInstance.setOption(dataOption)
    },
    // 对屏幕大小的调节
    screenAdapter () {
      const adapterOption = {}
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    }
  }
}
</script>

<style scoped>

</style>
