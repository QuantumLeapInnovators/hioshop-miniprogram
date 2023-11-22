const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()

Page({
    data: {
      username: "asdf",
      password: "asdf",
      userInfo: {},
      logining: false,
    },
    onLoad: function (options) {
        // this.getChannelShowInfo();
    },
    onHide: function () {
        // this.setData({
        //     autoplay: false
        // })
    },
    onShow: function () {
        // this.getIndexData();
        // var that = this;
        // that.goAuth();
        // let info = wx.getSystemInfoSync();
        // let sysHeight = info.windowHeight - 100;
        // this.setData({
        //     sysHeight: sysHeight,
        //     autoplay: true
        // });
        // wx.removeStorageSync('categoryId');
    },
    handleGetUserInfo(){
      console.info("handleGetUserInfo", this.data.username, this.data.password)
      let that = this;
      wx.showLoading({
        mask:true
      })

      // get code
      wx.login({
        success (res) {
          if (res.code) {
            console.info("res.code", res.code)
            let code = res.code;
            // get userInfo
            wx.getUserInfo({
              success: function(res) {
                // var userInfo = res.userInfo
                console.info("wxUserInfo", res.userInfo)
                // var nickName = userInfo.nickName
                // var avatarUrl = userInfo.avatarUrl
                // var gender = userInfo.gender //性别 0：未知、1：男、2：女
                // var province = userInfo.province
                // var city = userInfo.city
                // var country = userInfo.country
                
                util.request(api.AuthLoginByWeixinAndPwd, {
                  code: code,
                  username: that.data.username,
                  password: that.data.password,
                  wxUserInfo: res.userInfo
                }, 'POST').then(function (res) {
                  wx.hideLoading();
                  if (res.errno === 0) {
                    let userInfo = res.data.userInfo;
                    that.setData({
                      userInfo: userInfo,
                    })
                    wx.setStorageSync('token', res.data.token);
                    wx.setStorageSync('userInfo', userInfo);
                    app.globalData.token = res.data.token;
                    console.info("登陆成功", userInfo)
                    wx.switchTab({
                      url: '/pages/index/index'
                  })
                  }
                }).catch(()=>{
                  wx.hideLoading();
                });
              },
              fail:()=>{
                wx.hideLoading();
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        },
        fail:()=>{
          wx.hideLoading();
        }
      })
    },
    goAuth() {
      let that = this;
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo != '') {
          that.setData({
              userInfo: userInfo,
          });
          return;
      };
      let code = '';
      wx.login({
        success: (res) => {
          code = res.code;
          that.postLogin(code)
        },
      });
    },
    postLogin(code) {
      let that = this;
      util.request(api.AuthLoginByWeixin, {
        code: code
      }, 'POST').then(function (res) {
        if (res.errno === 0) {
          let userInfo = res.data.userInfo;
          that.setData({
            is_new: res.data.is_new,
            userInfo: userInfo,
            hasUserInfo: true
          })
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('userInfo', userInfo);
          app.globalData.token = res.data.token;
        }
      });
    },
    getChannelShowInfo: function (e) {
        let that = this;
        util.request(api.ShowSettings).then(function (res) {
            if (res.errno === 0) {
                let show_channel = res.data.channel;
                let show_banner = res.data.banner;
                let show_notice = res.data.notice;
                let index_banner_img = res.data.index_banner_img;
                that.setData({
                    show_channel: show_channel,
                    show_banner: show_banner,
                    show_notice: show_notice,
                    index_banner_img: index_banner_img
                });
            }
        });
    },
})