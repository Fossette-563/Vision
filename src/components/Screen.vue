<template>
  <div :style="containerStyle" class="screen-container">
    <header class="screen-header">
      <div><img :src="borderSrc" alt=""></div>
      <span class="logo"> <img :src="logoSrc" alt=""/> </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="changeTheme">
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'Screen',
  data () {
    return {
      chartInstance: 'chalk'
    }
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
    },
    computed: {
      ...mapState(['theme']),
      borderSrc () {
        return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
      },
      logoSrc () {
        return '/static/img/' + getThemeValue(this.theme).logoSrc
      },
      themeSrc () {
        return '/static/img/' + getThemeValue(this.theme).themeSrc
      },
      containerStyle () {
        return {
          backgroundColor: getThemeValue(this.theme).backgroundColor,
          color: getThemeValue(this.theme).titleColor
        }
      }
    },
    watch: {
      theme () {
        this.chartInstance.dispose()
        this.initChart()
        this.screenAdapter()
        this.updateChart()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}

.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;

  > div {
    img {
      width: 100%;
    }
  }

  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }

  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }

  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }

  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }

  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);

    img {
      height: 35px;
      width: 128px;
    }
  }
}
</style>
