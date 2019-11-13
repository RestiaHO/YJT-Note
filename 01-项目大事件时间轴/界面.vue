<template>
  <div id="projectNote">
    <span class="title">项目大事记</span>
    <Row>
      <!-- 标题 -->
      <Col span="24">
        <div class="basicTips">
          基础架构编辑
          <span>{{ curStartTime }} - {{ curEndTime }}</span>
        </div>
      </Col>

      <!-- 时间轴 -->
      <Col span="24">
        <div class="P_tree"></div>
      </Col>
    </Row>
  </div>
</template>

<script>
import $ from "jquery";
import storage from "@/libs/storage.js";
import dayjs from "dayjs";
import dialog from "@/libs/dialog";
import projectManageAPI from "@/api/projectManage.js";
import apiMethod from "@/libs/GeneralOperation.js";
import leftImg from "@/assets/images/left.png";
import upImg from "@/assets/images/up.png";
import cricle1Img from "@/assets/images/cricle1.png";
import rightImg from "@/assets/images/right.png";
import downImg from "@/assets/images/down.png";
import upSelectImg from "@/assets/images/upSelect.png";
import downSelectImg from "@/assets/images/downSelect.png";
import leftSelectImg from "@/assets/images/leftSelect.png";
import rightSelectImg from "@/assets/images/rightSelect.png";

export default {
  data() {
    return {
      curStartTime: "",
      curEndTime: "",
      progresssArr: [], // 时间轴数据源
      currentRow: [],
      gatteModel: null, // 甘特图对象
      gatteArr: [], // 甘特图时间数据源
      timeInterval: "month", // 时间刻度
      startTime: "", // 计划开始日期
      endTime: "", // 计划结束日期
      loading: false,
      nodeLoading: false,
      nodeData: [],
      nodeColumn: [
        {
          title: "序号",
          type: "index",
          width: 80,
          align: "center"
        },
        {
          title: "节点名称",
          key: "n_name",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "开始时间",
          key: "n_startTime",
          minWidth: 120,
          tooltip: true,
          render: (h, params) => {
            return h(
              "span",
              dayjs(params.row.n_startTime).format("YYYY-MM-DD")
            );
          }
        },
        {
          title: "结束时间",
          key: "n_endTime",
          minWidth: 120,
          tooltip: true,
          render: (h, params) => {
            return h("span", dayjs(params.row.n_endTime).format("YYYY-MM-DD"));
          }
        }
      ],
      progressData: [], // 进度表格数据
      progressColum: [
        {
          title: "序号",
          width: 80,
          align: "center",
          type: "index"
        },
        {
          title: "事件名称",
          key: "e_name",
          tooltip: true
        },
        {
          title: "发生时间",
          key: "e_occTime",
          tooltip: true,
          render: (h, params) => {
            return h("span", dayjs(params.row.e_occTime).format("YYYY-MM-DD"));
          }
        },
        {
          title: "所属节点名称",
          key: "n_name",
          tooltip: true
        },
        {
          title: "事件描述",
          key: "e_detail",
          tooltip: true
        },
        {
          title: "操作",
          tooltip: true,
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    color: "#10B1F9",
                    marginRight: "15px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.ShowEventDetailByID(params.row);
                    }
                  }
                },
                "查看"
              ),
              h(
                "span",
                {
                  style: {
                    color: "#10B1F9",
                    marginRight: "15px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.EditEventByID(params.row);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "span",
                {
                  style: {
                    color: "#DF242F",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.getDelNodeEvent(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ]
    };
  },
  mounted() {
    this.getNodeList();
  },
  methods: {
    ShowEventDetailByID(nModel) {
      this.$parent.componentName = "showEventDetailPage";
      this.$nextTick(() => {
        let model = this.$parent.$children[0].eventModal,
          children = this.$parent.$children[0];
        model.e_id = nModel.e_id;
        model.n_id = nModel.n_id;
        model.n_name = this.currentRow[0].n_name;
        model.e_name = nModel.e_name;
        model.e_detail = nModel.e_detail;
        model.e_occTime = dayjs(nModel.e_occTime).format("YYYY-MM-DD");
        if (nModel.e_imgs !== "") {
          children.eventDatas = nModel.e_imgs.split(",");
        }
        children.startTime = nModel.n_startTime;
        children.endTime = nModel.n_endTime;
      });
    },

    initProgressTree() {
      var progress = new this.ProgressTree({
        div: $(".P_tree"),
        contentDiv: "",
        className: "YJT-ProgressTree-Item1",
        classNameSelect: "YJT-ProgressTree-ItemSelect1",
        isVertical: false,
        Datas: Array.from(this.progresssArr),
        click: function(data) {}
      });
    },

    GatteList(item) {
      //div,showType,from,to,Datas:[{from,to,..,color..id}],click({data}),scrollY(top),scrollX(left),className...,groupWidth,maxHeight,dataHeight,//month,day,hour,minute,second
      if (item.showType == null) item.showType = "month";
      if (item.groupWidth == null) item.groupWidth = 30;
      if (typeof item.from == "string") item.from = new Date(item.from);
      if (typeof item.to == "string") item.to = new Date(item.to);
      var me = this;

      var scrollTop1 = 0;
      var fy;
      var fM;
      var fd;
      var fh;
      var fm;
      var fs;
      var ty;
      var tM;
      var td;
      var th;
      var tm;
      var ts;
      var init = function() {
        fy = item.from.getFullYear();
        fM = item.from.getMonth() + 1;
        fd = item.from.getDate();
        fh = item.from.getHours();
        fm = item.from.getMinutes();
        fs = item.from.getSeconds();
        ty = item.to.getFullYear();
        tM = item.to.getMonth() + 1;
        td = item.to.getDate();
        th = item.to.getHours();
        tm = item.to.getMinutes();
        ts = item.to.getSeconds();
        var groups = []; //title,groups:[title]
        if (item.showType == "day") {
          for (var iY = fy; iY <= ty; iY++) {
            for (var iM = iY == fy ? fM : 1; iM <= (iY == ty ? tM : 12); iM++) {
              var childDatas = [];
              for (
                var j = iY == fy && iM == fM ? fd : 1;
                j <= (iY == ty && iM == tM ? td : getDayByMonth(iY, iM));
                j++
              ) {
                childDatas.push(j);
              }
              var g = {
                title: childDatas.length > 2 ? iY + "年" + iM + "月" : "",
                groups: childDatas
              };
              groups.push(g);
            }
          }
        } else if (item.showType == "hour") {
          for (var iY = fy; iY <= ty; iY++) {
            for (var iM = iY == fy ? fM : 1; iM <= (iY == ty ? tM : 12); iM++) {
              for (
                var iD = iY == fy && iM == fM ? fd : 1;
                iD <= (iY == ty && iM == tM ? td : getDayByMonth(iY, iM));
                iD++
              ) {
                var childDatas = [];
                for (
                  var j = iY == fy && iM == fM && iD == fd ? fh : 1;
                  j <= (iY == ty && iM == tM && iD == td ? th : 24);
                  j++
                ) {
                  childDatas.push(j);
                }
                var g = {
                  title:
                    childDatas.length > 2
                      ? iY + "年" + iM + "月" + iD + "日"
                      : "",
                  groups: childDatas
                };
                groups.push(g);
              }
            }
          }
        } else if (item.showType == "minute") {
          for (var iY = fy; iY <= ty; iY++) {
            for (var iM = iY == fy ? fM : 1; iM <= (iY == ty ? tM : 12); iM++) {
              for (
                var iD = iY == fy && iM == fM ? fd : 1;
                iD <= (iY == ty && iM == tM ? td : getDayByMonth(iY, iM));
                iD++
              ) {
                for (
                  var iH = iY == fy && iM == fM && iD == fd ? fh : 1;
                  iH <= (iY == ty && iM == tM && iD == td ? th : 24);
                  iH++
                ) {
                  var childDatas = [];
                  for (
                    var j =
                      iY == fy && iM == fM && iD == fd && iH == fh ? fm : 1;
                    j <=
                    (iY == ty && iM == tM && iD == td && iH == th ? tm : 60);
                    j++
                  ) {
                    childDatas.push(j);
                  }
                  var g = {
                    title:
                      childDatas.length > 3
                        ? iY + "年" + iM + "月" + iD + "日" + iH + "时"
                        : "",
                    groups: childDatas
                  };
                  groups.push(g);
                }
              }
            }
          }
        } else if (item.showType == "second") {
          for (var iY = fy; iY <= ty; iY++) {
            for (var iM = iY == fy ? fM : 1; iM <= (iY == ty ? tM : 12); iM++) {
              for (
                var iD = iY == fy && iM == fM ? fd : 1;
                iD <= (iY == ty && iM == tM ? td : getDayByMonth(iY, iM));
                iD++
              ) {
                for (
                  var iH = iY == fy && iM == fM && iD == fd ? fh : 1;
                  iH <= (iY == ty && iM == tM && iD == td ? th : 24);
                  iH++
                ) {
                  for (
                    var im =
                      iY == fy && iM == fM && iD == fd && iH == fh ? fm : 1;
                    im <=
                    (iY == ty && iM == tM && iD == td && iH == th ? tm : 60);
                    im++
                  ) {
                    var childDatas = [];
                    for (
                      var j =
                        iY == fy && iM == fM && iD == fd && iH == fh && im == fm
                          ? fs
                          : 1;
                      j <=
                      (iY == ty && iM == tM && iD == td && iH == th && im == tm
                        ? ts
                        : 60);
                      j++
                    ) {
                      childDatas.push(j);
                    }
                    var g = {
                      title:
                        childDatas.length > 3
                          ? iY +
                            "年" +
                            iM +
                            "月" +
                            iD +
                            "日" +
                            iH +
                            "时" +
                            im +
                            "分"
                          : "",
                      groups: childDatas
                    };
                    groups.push(g);
                  }
                }
              }
            }
          }
        } else {
          for (var iY = fy; iY <= ty; iY++) {
            var childDatas = [];
            for (var j = iY == fy ? fM : 1; j <= (iY == ty ? tM : 12); j++) {
              childDatas.push(j + "月");
            }
            var g = {
              title: childDatas.length > 1 ? iY + "年" : "",
              groups: childDatas
            };
            groups.push(g);
          }
        }
        //总宽度
        var allW = 1; //多计算1，避免错位
        for (var i = 0; i < groups.length; i++) {
          var w = item.groupWidth * groups[i].groups.length;
          allW += w;
        }
        var html = "";
        html +=
          '<div style="float:left;width:100%;height:100%;" class="' +
          (item.className ? item.className : "") +
          '">';
        //头部
        html +=
          '<div style="float:left;width:100%;height:100%;overflow:hidden;" class="groupScroll"><div style="float:left;width:' +
          allW +
          'px;height:100%;overflow:hidden;">';
        //分组
        html += '<div style="float:left;width:100%;">';
        for (var i = 0; i < groups.length; i++) {
          var w = item.groupWidth * groups[i].groups.length;
          html +=
            '<div style="float:left;width:' +
            w +
            'px;height:100%;" class="' +
            (item.classNameGroup ? item.classNameGroup : "") +
            " " +
            (i == 0 && item.classNameGroupFirst
              ? item.classNameGroupFirst
              : "") +
            " " +
            (i == groups.length - 1 && item.classNameGroupLast
              ? item.classNameGroupLast
              : "") +
            '">' +
            (groups[i].title ? groups[i].title : "&nbsp;") +
            "</div>";
        }
        html += "</div>";
        //表头
        html += '<div style="float:left;width:100%;">';
        for (var i = 0; i < groups.length; i++) {
          html += '<div style="float:left;height:100%;">';
          for (var j = 0; j < groups[i].groups.length; j++) {
            html +=
              '<div style="float:left;width:' +
              item.groupWidth +
              'px;height:100%;" class="' +
              (item.classNameItem ? item.classNameItem : "") +
              " " +
              (i == 0 && j == 0 && item.classNameItemFirst
                ? item.classNameItemFirst
                : "") +
              " " +
              (i == groups.length - 1 &&
              j == groups[i].groups.length - 1 &&
              item.classNameItemLast
                ? item.classNameItemLast
                : "") +
              '">' +
              groups[i].groups[j] +
              "</div>";
          }
          html += "</div>";
        }
        html += "</div></div></div>";

        //底部
        html +=
          '<div style="float:left;width:100%;height:100%;overflow:auto;' +
          (item.maxHeight ? "max-height:" + item.maxHeight + "px;" : "") +
          '" class="contentScroll"><div style="float:left;width:' +
          (allW + 17) +
          'px;height:100%;overflow:hidden;">';
        //内容背景
        html += '<div style="float:left;width:100%;">';
        for (var i = 0; i < groups.length; i++) {
          var w = item.groupWidth * groups[i].groups.length;
          html +=
            '<div style="float:left;width:' +
            w +
            'px;" class="' +
            (item.classNameContent ? item.classNameContent : "") +
            " " +
            (i == 0 && item.classNameContentFirst
              ? item.classNameContentFirst
              : "") +
            " " +
            (i == groups.length - 1 && item.classNameContentLast
              ? item.classNameContentLast
              : "") +
            ' content"></div>';
        }
        html += "</div>";
        //数据内容
        html +=
          '<div style="float:left;width:100%;height:0px;position:relative;" class="datas"></div>';
        html += "</div></div></div>";

        html += "</div>";
        $(item.div).html(html);
        scrollTop1 = $(item.div).find(".contentScroll")[0].scrollTop;
        $(item.div)
          .find(".contentScroll")
          .scroll(function() {
            if (scrollTop1 == $(this)[0].scrollTop) {
              $(item.div)
                .find(".groupScroll")
                .scrollLeft($(this)[0].scrollLeft);
              if (item.scrollX && isMouseIn)
                item.scrollX($(this)[0].scrollLeft);
            } else {
              scrollTop1 = $(item.div).find(".contentScroll")[0].scrollTop;
              if (item.scrollY && isMouseIn) item.scrollY($(this)[0].scrollTop);
            }
          });
        for (var i = 0; i < item.Datas.length; i++) {
          updateData(item.Datas[i], false);
        }
        updateAllHeight();
        $(item.div)
          .find(".contentScroll")
          .hover(
            function() {
              isMouseIn = true;
            },
            function() {
              isMouseIn = false;
            }
          );
      };
      var isMouseIn = false;
      this.ScrollYTo = function(top) {
        if (isMouseIn) return;
        $(item.div)
          .find(".contentScroll")
          .scrollTop(top);
      };
      var updateData = function(data, updateItem) {
        if (typeof data.from == "string") data.from = new Date(data.from);
        if (typeof data.to == "string") data.to = new Date(data.to);
        var to = data.to;
        if (data.isDayEnd) to = new Date(to.getTime() + 1000 * 60 * 60 * 24);
        var f = 0; //开始点
        var l = 0; //长度点
        if (item.showType == "day") {
          f =
            (data.from.getTime() - new Date(fy, fM - 1, fd).getTime()) /
            (1000 * 60 * 60 * 24);
          l = (to.getTime() - data.from.getTime()) / (1000 * 60 * 60 * 24);
        } else if (item.showType == "hour") {
          f =
            (data.from.getTime() - new Date(fy, fM - 1, fd, fh).getTime()) /
            (1000 * 60 * 60);
          l = (to.getTime() - data.from.getTime()) / (1000 * 60 * 60);
        } else if (item.showType == "minute") {
          f =
            (data.from.getTime() - new Date(fy, fM - 1, fd, fh, fm).getTime()) /
            (1000 * 60);
          l = (to.getTime() - data.from.getTime()) / (1000 * 60);
        } else if (item.showType == "second") {
          f =
            (data.from.getTime() -
              new Date(fy, fM - 1, fd, fh, fm, fs).getTime()) /
            1000;
          l = (to.getTime() - data.from.getTime()) / 1000 + 1; //秒钟为最小单位，所以需要+1
        } else {
          //月天数不定，则这样计算
          var _fy = data.from.getFullYear();
          var _fM = data.from.getMonth() + 1;
          var _fd = data.from.getDate();
          var _ty = to.getFullYear();
          var _tM = to.getMonth() + 1;
          var _td = to.getDate();
          f = (_fy - fy) * 12 + (_fM - fM) + (_fd - 0) / 30;
          l = (_ty - _fy) * 12 + (_tM - _fM) + (_td - _fd) / 30;
        }

        var div = $(document.createElement("div"));
        div.css("float", "left").css("width", "100%");
        div.html(
          '<div style="float:left;margin-left:' +
            item.groupWidth * f +
            "px;width:" +
            item.groupWidth * l +
            "px;background-color:" +
            data.color +
            '" class="' +
            item.classNameData +
            " data data_" +
            data.id +
            '">&nbsp;</div>'
        );
        if (item.click) {
          div.find(".data").click(function() {
            item.click(data);
          });
        }
        var oldDiv = $(item.div)
          .find(".datas .data_" + data.id)
          .parent();
        oldDiv = oldDiv.length == 0 ? null : oldDiv;
        if (oldDiv == null) {
          //新增
          $(item.div)
            .find(".datas")
            .append(div);
          if (updateItem) item.Datas.push(data);
        } else {
          div.insertAfter(oldDiv);
          oldDiv.remove();
          if (updateItem) {
            for (var i = 0; i < item.Datas.length; i++) {
              if (item.Datas[i].id == data.id) {
                item.Datas[i] = data;
                break;
              }
            }
          }
        }
        if (updateItem) updateAllHeight();
      };
      var updateAllHeight = function() {
        var allHeight = item.dataHeight * item.Datas.length;
        $(item.div)
          .find(".content")
          .css("height", allHeight + "px");
        $(item.div)
          .find(".datas")
          .css("top", -allHeight + "px");
      };
      var getDayByMonth = function(y, m) {
        return new Date(y, m, 0).getDate();
      };
      this.ScrollTo = function(data) {
        //data/from//时间到指定点，对象到提前2格
        if (data == null) return;
        var isData = true;
        if (data.from == null) {
          data = {
            from: data
          };
          isData = false;
        }
        var f = 0;
        if (item.showType == "day") {
          f =
            (data.from.getTime() - new Date(fy, fM - 1, fd).getTime()) /
            (1000 * 60 * 60 * 24);
        } else if (item.showType == "hour") {
          f =
            (data.from.getTime() - new Date(fy, fM - 1, fd, fh).getTime()) /
            (1000 * 60 * 60);
        } else if (item.showType == "minute") {
          f =
            (data.from.getTime() - new Date(fy, fM - 1, fd, fh, fm).getTime()) /
            (1000 * 60);
        } else if (item.showType == "second") {
          f =
            (data.from.getTime() -
              new Date(fy, fM - 1, fd, fh, fm, fs).getTime()) /
            1000;
        } else {
          //月天数不定，则这样计算
          var _fy = data.from.getFullYear();
          var _fM = data.from.getMonth() + 1;
          var _fd = data.from.getDate();
          f = (_fy - fy) * 12 + (_fM - fM) + (_fd - 0) / 30;
        }
        if (isData) f -= 2; //移位2格，以便查看
        $(item.div)
          .find(".contentScroll")
          .scrollLeft(f * item.groupWidth);
      };
      this.GetScroll = function() {
        //获得当前时间
        var f =
          $(item.div).find(".contentScroll")[0].scrollLeft / item.groupWidth;
        if (item.showType == "day") {
          f = f * (1000 * 60 * 60 * 24) + new Date(fy, fM - 1, fd).getTime();
        } else if (item.showType == "hour") {
          f = f * (1000 * 60 * 60) + new Date(fy, fM - 1, fd, fh).getTime();
        } else if (item.showType == "minute") {
          f = f * (1000 * 60) + new Date(fy, fM - 1, fd, fh, fm).getTime();
        } else if (item.showType == "second") {
          f = f * 1000 + new Date(fy, fM - 1, fd, fh, fm, fs).getTime();
        } else {
          //月天数不定，则这样计算
          var _fy = parseInt(f / 12);
          var _fM = parseInt(f % 12);
          var _fd = ((f % 12) - _fM) * 30;
          f = new Date(fy + _fy, fM + _fM - 1, 1 + _fd).getTime();
        }
        return new Date(f);
      };
      this.SetShowType = function(showType, groupWidth) {
        //groupWidth可为null
        if (item.showType == showType) {
          if (groupWidth == null || item.groupWidth == groupWidth) return;
        }
        if (groupWidth != null) item.groupWidth = groupWidth;
        var scroll = me.GetScroll();
        item.showType = showType;
        init();
        me.ScrollTo(scroll);
      };
      this.GetShowType = function() {
        return item.showType;
      };
      this.UpdateData = function(data, scrollTo) {
        updateData(data, true);
        if (scrollTo) me.ScrollTo(data);
      };
      this.DelData = function(data) {
        if (data == null) return;
        me.DelDataByID(data.id);
      };
      this.DelDataByID = function(id) {
        var oldDiv = $(item.div)
          .find(".datas .data_" + id)
          .parent();
        oldDiv.remove();
        var datas = [];
        for (var i = 0; i < item.Datas.length; i++) {
          if (item.Datas[i].id == id) continue;
          datas.push(item.Datas[i]);
        }
        item.Datas = datas;
        updateAllHeight();
      };
      init();
    },

    // 2. 在方法中创建一个 时间轴 构造函数 `ProgressTree`，该构造函数通过js代码生成dom（html）标签
    ProgressTree(item) {
      //div,contentDiv,isVertical:true,Datas[{date,title,content,id}],click(data),className,classNameSelect
      var me = this;
      var classNameSelected = "_select";
      var init = function() {

        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
          // 设置了css样式属性
        var html = "";
        var marginLeft = 30;
        var marginRight = 30;
        var perHeight = 137;
        var perSpaceHeight =
          ($(item.div).width() - marginLeft - (marginRight + perHeight)) /
          (item.Datas.length - 1);
        if (item.isVertical) {
          perHeight = 107;
          perSpaceHeight =
            ($(item.div).height() - marginLeft - (marginRight + perHeight)) /
            (item.Datas.length - 1);
        }
        var minHeight = "100%";
        if (perSpaceHeight < perHeight / 2) {
          perSpaceHeight = perHeight / 2;
          minHeight =
            (item.Datas.length - 1) * perSpaceHeight +
            marginLeft +
            (marginRight + perHeight) +
            "px";
        }

        //上面部分
        html += '<div style="float:left;width:100%;height:100%;">';
        html +=
          '<div style="float:left;' +
          (item.isVertical
            ? "width:156px;height:100%;"
            : "width:100%;height:80px;") +
          '">';

        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        //   2.2 循环展示Data数据源
        for (var i = 0; i < item.Datas.length; i++) {

        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
            //2.2.1 奇数为在上,偶数位在下
          if (i % 2 == 1) continue;
          var left = marginLeft;
          if (i > 0) left = 2 * perSpaceHeight - perHeight;
          var data = item.Datas[i];
          html +=
            '<div style="float:left;' +
            (item.isVertical
              ? "background-image:url(" +
                leftImg +
                ");width:106px;height:27px;margin-top:" +
                left +
                "px;margin-left:50px;"
              : "background-image:url(" +
                upImg +
                ");width:27px;height:61px;margin-top:20px;margin-left:" +
                left +
                "px;") +
            '" class="' +
            (item.isVertical ? "left" : "up") +
            '"></div><div style="float:left;width:90px;height:80px;" class="' +
            (item.className ? item.className : "") +
            " data data_" +
            i +
            '" dataIndex="' +
            i +
            '"><div style="float:left;width:100%;">' +
            format(data.date, "yyyy年MM月dd日") +
            '</div><div style="float:left;width:100%;max-height:50px;">' +
            data.title +
            "</div></div>";
        }
        html += "</div>";
        html +=
          '<div style="float:left;' +
          (item.isVertical
            ? "height:" + minHeight + ";width:2px;background-color:#7355BE;"
            : "width:100%;height:2px;background-color:#CCCCCC;") +
          '"><div style="float:left;width:8px;height:8px;background-image:url(' +
          cricle1Img +
          ");background-size:contain;" +
          (item.isVertical ? "margin-left:-3px;" : "margin-top:-3px;") +
          'background-color:white;"></div>' +
          (item.isVertical
            ? '<div style="float:left;width:100%;height:100%;"></div>'
            : "") +
          '<div style="float:right;width:8px;height:8px;background-image:url(' +
          cricle1Img +
          ");background-size:contain;" +
          (item.isVertical
            ? "margin-right:-3px;margin-top:-16px;"
            : "margin-top:-3px;") +
          'background-color:white;"></div></div>';

        //下面部分
        html +=
          '<div style="float:left;' +
          (item.isVertical
            ? "width:106px;height:100%;"
            : "width:100%;height:80px;") +
          '">';
        for (var i = 0; i < item.Datas.length; i++) {


        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
            //2.2.2 奇数为在上,偶数位在下
          if (i % 2 == 0) continue;
          var left = marginLeft + perSpaceHeight;
          if (i > 1) left = 2 * perSpaceHeight - perHeight;
          var data = item.Datas[i];
          html +=
            '<div style="float:left;' +
            (item.isVertical
              ? "background-image:url(" +
                rightImg +
                ");width:106px;height:27px;margin-top:" +
                left +
                "px;"
              : "background-image:url(" +
                downImg +
                ");width:27px;height:61px;margin-left:" +
                left +
                "px;") +
            '" class="' +
            (item.isVertical ? "right" : "down") +
            '"></div><div style="float:left;width:90px;height:80px;' +
            (item.isVertical ? "margin-left:50px;" : "margin-top:35px;") +
            '" class="' +
            (item.className ? item.className : "") +
            " data data_" +
            i +
            '" dataIndex="' +
            i +
            '"><div style="float:left;width:100%;">' +
            format(data.date, "yyyy年MM月dd日") +
            '</div><div style="float:left;width:100%;max-height:50px;">' +
            data.title +
            "</div></div>";
        }
        html += "</div>";
        html += "</div>";

        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        // 3. 对目标class 傅予以上 html 
        $(item.div).html(html);


        for (var i = 0; i < item.Datas.length; i++) {
            // 给子元素添加样式
          var contentDiv = $(item.contentDiv).find(".data_" + i);
          contentDiv = contentDiv.length == 0 ? null : contentDiv;
          if (contentDiv == null) {
            contentDiv = $(document.createElement("div"));
            contentDiv.addClass("data_" + i).addClass("data");
            contentDiv
              .css("float", "left")
              .css("width", "100%")
              .css("height", "100%");

            var div1 = $(document.createElement("div"));
            div1
              .css("float", "left")
              .css("width", "100%")
              .css("height", "100%");
            div1.html(item.Datas[i].content);
            var div2 = $(document.createElement("div"));
            div2
              .css("float", "left")
              .css("width", "100%")
              .css("height", "50px");
            contentDiv.append(div1);
            contentDiv.append(div2);

            $(item.contentDiv).append(contentDiv);
          }
        }

        // 给子元素添加点击事件
        $(item.div)
          .find(".data")
          .click(function() {
            var i = parseInt($(this).attr("dataIndex"));
            selectData(i, true);
            if (item.click) item.click(item.Datas[i]);
          });
        $(item.contentDiv).scroll(function(evt) {
          var top = $(this)[0].scrollTop;
          var middle = $(item.contentDiv).height() / 3;
          var h = 0;
          var i = 0;
          while (true) {
            h += $(item.contentDiv)
              .find(".data_" + i)
              .height();
            if (top < h - middle) {
              selectData(i, false);
              break;
            }
            i++;
            if (i >= item.Datas.length) {
              i--;
              selectData(i, false);
              break;
            }
          }
        });
        if (item.Datas.length > 0)
          $(item.div)
            .find(".data_0")
            .click();
      };

      this.SelectData = function(data, scrollTo) {
        for (var i = 0; i < item.Datas.length; i++) {
          if (item.Datas[i].id == data.id) {
            selectData(i, scrollTo);
            break;
          }
        }
      };

      var selectData = function(i, scrollTo) {
        var div = $(item.div).find(".data_" + i);
        if (item.classNameSelect) {
          $(item.div)
            .find(".data")
            .removeClass(item.classNameSelect);
          div.addClass(item.classNameSelect);
          $(item.div)
            .find(".up")
            .css("background-image", "url(" + upImg + ")");
          $(item.div)
            .find(".down")
            .css("background-image", "url(" + downImg + ")");
          $(item.div)
            .find(".left")
            .css("background-image", "url(" + leftImg + ")");
          $(item.div)
            .find(".right")
            .css("background-image", "url(" + rightImg + ")");
        }
        $(item.div)
          .find(".data")
          .removeClass(classNameSelected);
        div.addClass(classNameSelected);
        if (div.prev().hasClass("up"))
          div.prev().css("background-image", "url(" + upSelectImg + ")");
        else if (div.prev().hasClass("down"))
          div.prev().css("background-image", "url(" + downSelectImg + ")");
        else if (div.prev().hasClass("left"))
          div.prev().css("background-image", "url(" + leftSelectImg + ")");
        else if (div.prev().hasClass("right"))
          div.prev().css("background-image", "url(" + rightSelectImg + ")");
        if (scrollTo) {
          var k = i - 1;
          var h = 0;
          while (k >= 0) {
            h += $(item.contentDiv)
              .find(".data_" + k)

        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
            //   方法，返回元素高度
              .height();
            k--;
          }

        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        //   设置 元素 中滚动条的垂直偏移
          $(item.contentDiv).scrollTop(h);
        }
      };


      this.GetSelectData = function() {
        var i = $(item.div)
          .find("." + classNameSelected)
          .attr("dataIndex");
        if (i == null) return null;
        return item.Datas[i];
      };
      
      var format = function(date, format) {
        var d = {
          "M+": date.getMonth() + 1,
          "d+": date.getDate(),
          "h+": date.getHours(),
          "m+": date.getMinutes(),
          "s+": date.getSeconds(),
          "q+": Math.floor((date.getMonth() + 3) / 3),
          "S+": date.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
          format = format.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
          );
        }
        for (var k in d) {
          if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(
              RegExp.$1,
              RegExp.$1.length == 1
                ? d[k]
                : ("00" + d[k]).substr(("" + d[k]).length)
            );
          }
        }
        return format;
      };
      init();
    },
    ImageList(item) {
      //Datas[url],close()
      var me = this;
      var div = null;
      var classNameSelected = "_select";
      var init = function() {
        div = $(document.createElement("div"));
        div
          .css("background-color", "#323740")
          .css("width", "100%")
          .css("height", "100%")
          .css("position", "absolute")
          .css("overflow", "hidden");
        var html = "";
        html +=
          '<table cellSpacing="0" cellPadding="0" border="0" style="table-layout:fixed;margin:0px;padding:0px;width:100%;height:100%;"><tr style="height:100%;"><td style="width:100px;"></td><td style="width:100%;">';
        html +=
          '<table cellSpacing="0" cellPadding="0" border="0" style="table-layout:fixed;margin:0px;padding:0px;width:100%;height:100%;"><tr style="height:10px;"><td style="width:100%;"></td></tr><tr style="height:100%;"><td style="width:100%;">';
        //内容区域
        html +=
          '<div style="float:left;width:100%;height:100%;background-repeat:no-repeat;background-size:contain;background-position:center center;" class="dataCenter"></div>';
        html +=
          '</td></tr><tr style="height:30px;"><td class="pageText" align="center" style="color:white;"></td></tr></table>';
        html += '</td><td style="width:100px;">';
        //列表
        html +=
          '<div style="float:left;width:50px;height:100%;"><table cellSpacing="0" cellPadding="0" border="0" style="table-layout:fixed;margin:0px;padding:0px;width:100%;height:100%;"><tr style="height:120px;" valign="bottom"><td><div style="float:left;width:50px;height:20px;background-color:#464B54;border:1px solid #1F242F;cursor:pointer;" class="btnUp"><div style="background-image:url(../../../../../assets/images/arrowUp.png);width:20px;height:10px;;margin-left:auto;margin-right:auto;margin-top:5px;"></div></div></td></tr><tr style="height:100%;" valign="top"><td><div style="float:left;width:50px;height:100%;max-height:100%;overflow-y:scroll;" class="hiddenScroll dataList">';
        for (var i = 0; i < item.Datas.length; i++) {
          html +=
            '<div style="float:left;width:50px;height:50px;cursor:pointer;background-image:url(../../../../../assets/images/' +
            item.Datas[i] +
            ");background-size:contain;background-position:center center;" +
            (i == 0 ? "margin-top:6px;" : "") +
            'margin-bottom:6px;border:4px solid transparent;" class="data data_' +
            i +
            '" url="' +
            item.Datas[i] +
            '" dataIndex="' +
            i +
            '"></div>';
        }
        html +=
          '</div></td></tr><tr style="height:120px;" valign="top"><td><div style="float:left;width:50px;height:20px;background-color:#464B54;border:1px solid #1F242F;cursor:pointer;" class="btnDown"><div style="background-image:url(../../../../../assets/images/arrowDown.png);width:20px;height:10px;;margin-left:auto;margin-right:auto;margin-top:5px;"></div></div></td></tr></table></div>';
        html +=
          '</td></tr></table><div class="btnClose" style="background-image:url(../../../../../assets/images/close.png);width:32px;height:32px;top:0px;right:0px;position:absolute;cursor:pointer;"></div>';

        for (var i = 0; i < item.Datas.lenth; i++) {
          html += "";
        }
        div.html(html);
        $(document.body).append(div);

        var overflowX = $(document.body).css("overflow-x");
        var overflowY = $(document.body).css("overflow-y");
        $(document.body).css("overflow-x", "hidden");
        $(document.body).css("overflow-y", "hidden");
        div.find(".btnClose").click(function() {
          if (item.close) {
            if (item.close() == false) return;
          }
          $(document.body).css("overflow-x", overflowX);
          $(document.body).css("overflow-y", overflowY);
          div.remove();
        });
        div.find(".btnUp").click(function() {
          getSelectDiv()
            .prev()
            .click();
        });
        div.find(".btnDown").click(function() {
          getSelectDiv()
            .next()
            .click();
        });
        div.find(".data").click(function() {
          div.find(".data").removeClass(classNameSelected);
          div.find(".data").css("border-color", "transparent");

          $(this).addClass(classNameSelected);
          $(this).css("border-color", "#519CEA");
          div
            .find(".dataCenter")
            .css("background-image", "url(" + $(this).attr("url") + ")");
          showPage(parseInt($(this).attr("dataIndex")) + 1);
        });
        if (item.Datas.length > 0) div.find(".data_0").click();
      };
      var getSelectDiv = function() {
        return div.find("." + classNameSelected);
      };
      var showPage = function(page) {
        div
          .find(".pageText")
          .html(
            page +
              '/<font style="color:#149AD9;">' +
              item.Datas.length +
              "</font>"
          );
        var index = page - 1;
        var perHeight = 56;
        var top = div.find(".dataList")[0].scrollTop;
        var showIndex1 =
          parseInt(top / perHeight) + (top % perHeight == 0 ? 0 : 1); //此及以上均显示出来
        var showIndex2 = parseInt(
          (top + div.find(".dataList").height() - 6) / perHeight
        ); //此及以下均显示出来

        if (showIndex1 > index || showIndex2 < index)
          div.find(".dataList").scrollTop(perHeight * index);
      };
      init();
    },
    // 根据事件id编辑事件
    EditEventByID(nModel) {
      if (this.currentRow.length !== 0) {
        this.$parent.componentName = "editEventPage";
        this.$nextTick(() => {
          let model = this.$parent.$children[0].eventModal,
            children = this.$parent.$children[0];
          model.e_id = nModel.e_id;
          model.n_id = nModel.n_id;
          model.n_name = this.currentRow[0].n_name;
          model.e_name = nModel.e_name;
          model.e_detail = nModel.e_detail;
          model.e_occTime = nModel.e_occTime;
          model.tempE_occTime = nModel.e_occTime;
          children.eventDatas =
            nModel.e_imgs.split(",").length > 0 ? nModel.e_imgs.split(",") : [];
          children.startTime = this.currentRow[0].n_startTime;
          children.endTime = this.currentRow[0].n_endTime;
        });
      }
    },
    // 添加节点
    addEvent() {
      if (this.currentRow.length !== 0) {
        this.$parent.componentName = "addEventpage";
        this.$nextTick(() => {
          this.$parent.$children[0].eventModal.n_id = this.currentRow[0].n_id;
          this.$parent.$children[0].eventModal.n_name = this.currentRow[0].n_name;
          this.$parent.$children[0].startTime = this.currentRow[0].n_startTime;
          this.$parent.$children[0].endTime = this.currentRow[0].n_endTime;
        });
      } else {
        dialog.warning("请选择一行数据");
        return;
      }
    },
    // 根据节点id删除节点
    getDelNodeEvent(row) {
      let that = this;
      apiMethod.deleteMethodCommon(
        [row.e_id],
        "您真的要删除该事件吗？",
        onOK => {
          // 因为这里是个Promise对象 所以必须要返回
          return projectManageAPI.getDelNodeEvent(row.e_id);
        },
        callback => {
          return that.getCurrentRow(that.currentRow[0], null);
        }
      );
    },
    // 获取节点表格数据
    getNodeList() {
      this.nodeLoading = true;
      let _this = this;
      _this.nodeData = [];
      _this.gatteArr = [];
      projectManageAPI
        .getNodeList(storage.get("cid"), storage.get("proId"))
        .then(res => {
          if (res.data.code == 200) {
            _this.startTime = "";
            _this.endTime = "";
            _this.startTime = dayjs(res.data.begindate).format("YYYY.MM.DD");
            _this.endTime = dayjs(res.data.enddate).format("YYYY.MM.DD");
            if (res.data.datas.length !== 0) {
              let data = res.data.datas;
              // 解决数组内存地址指向同一个data的问题
              // 修改一个数组，另一个数组也会更改
              _this.nodeData = data;
              _this.nodeData[0]._highlight = true;

              let colorFinish = "#CCCCCC",
                colorStop = "#F34B1D",
                colorNoFinish = "#05A8FA";

              this.nodeData.forEach(item => {
                let color = "";
                switch (item.n_isacc) {
                  case -1:
                    color = colorStop;
                    break;
                  case 0:
                    color = colorNoFinish;
                    break;
                  case 1:
                    color = colorFinish;
                    break;
                }
                this.gatteArr.push({
                  from: item.n_startTime,
                  to: item.n_endTime,
                  color: color,
                  id: item.n_id,
                  isDayEnd: true
                });
              });

              this.$nextTick(() => {
                this.initGatte();
                this.changeTimeInterval(this.timeInterval);
                this.getCurrentRow(this.nodeData[0], null);
              });

              setTimeout(() => {
                $("#nodeTable .ivu-table-overflowY").scroll(function() {
                  _this.gatteModel.ScrollYTo(
                    $("#nodeTable .ivu-table-overflowY")[0].scrollTop
                  );
                });
              }, 0);
              this.nodeData[0]._highlight = true;
              this.nodePageTotal = res.data.datas.length;
            } else {
              this.$nextTick(() => {
                this.initGatte();
                this.changeTimeInterval(this.timeInterval);
              });
            }
          }
        });
      this.nodeLoading = false;
    },
    initGatte() {
      let that = this;
      this.gatteModel = new this.GatteList({
        div: document.querySelector(".P_gatte"),
        dataHeight: 40,
        maxHeight: 230,
        className: "YJT-Gantte1",
        classNameGroup: "YJT-Gantte-Group1", // 年样式
        classNameItem: "YJT-Gantte-Item1", // 月样式
        classNameItemLast: "YJT-Gantte-Item-Last1", // 最后一个月样式
        classNameContent: "YJT-Gantte-Content1", // 时间刻度背景块样式
        classNameContentFirst: "YJT-Gantte-Content-First1", // 第一个时间刻度背景块样式
        classNameData: "YJT-Gantte-Data1", // 时间条的样式
        from: this.startTime, // 时间暂时支持字符串和时间对象
        to: this.endTime,
        Datas: this.gatteArr,
        click: function(data) {
          that.getNodeEventList(data.id);
          that.gatteModel.ScrollTo(data);
        },
        scrollY: function(top) {
          $("#nodeTable .ivu-table-overflowY").scrollTop(top); // 纵向滚动条
        }
      });
    },
    changeTimeInterval(label) {
      if (this.gatteModel !== null && this.gatteModel !== "") {
        this.gatteModel.SetShowType(label, 42);
      }
    },
    getCurrentRow(currentRow, oldCurrentRow) {
      this.nodeData[0]._highlight = false;
      this.currentRow = [];
      this.curStartTime  = "";
      this.curEndTime  = "";
      this.currentRow.push(currentRow);

      let colorStop = "#05A8FA",
        colorNoFinish = "#F34B1D",
        colorFinish = "#CCCCCC",
        color = "";
      switch (currentRow.n_isacc) {
        case -1:
          color = colorStop;
          break;
        case 0:
          color = colorNoFinish;
          break;
        case 1:
          color = colorFinish;
          break;
      }
      this.gatteModel.ScrollTo({
        from: new Date(currentRow.n_startTime),
        to: new Date(currentRow.n_endTime),
        id: currentRow.n_id,
        color: color
      });
      this.getNodeEventList(currentRow.n_id);
      if (
        currentRow.n_startTime !== undefined &&
        currentRow.n_endTime !== undefined
      ) {
        this.curStartTime = dayjs(currentRow.n_startTime).format("YYYY-MM-DD");
        this.curEndTime = dayjs(currentRow.n_endTime).format("YYYY-MM-DD");
      }
    },
    getNodeEventList(n_id) {
      this.loading = true;
      projectManageAPI
        .getNodeEventList(n_id, storage.get("proId"), storage.get("cid"))
        .then(res => {
          this.progressData = [];
          if (res.data.code == 200) {
            this.progresssArr = [];
            res.data.datas.forEach(item => {
              this.progresssArr.push({
                date: new Date(item.e_occTime),
                title: item.e_name,
                content: item.e_detail
              });
            });
            this.initProgressTree();
            this.progressData = res.data.datas;
          }
        });
      this.loading = false;
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../../plugin/Page/page.css";

#projectNote {
  width: 100%;
  .title {
    font-size: 22px;
    font-weight: 400;
    padding-top: 10px;
    margin-right: 33px;
    display: block;
  }
  .title::before {
    content: "";
    background: #10b1f9;
    height: 20px;
    width: 4px;
    display: inline-flex;
    margin: 0 8px 0 20px;
    vertical-align: middle;
  }
  .title::after {
    content: "";
    height: 1px;
    display: block;
    background: #e6e6e6;
    width: 100%;
    margin: 17px 0 17px 16px;
  }
  #addNode {
    margin: 20px;
    padding: 8px 32px;
    width: 200px;
    cursor: pointer;
    line-height: 25px;
    text-align: center;
    background: rgba(16, 177, 249, 1);
    border-radius: 2px;
    font-size: 18px;
    color: white;
    font-family: Microsoft YaHei;
  }
  .tips {
    font-size: 14px;
    margin-left: 16px;
    margin-bottom: 10px;
  }
  .P_gatte {
    margin-top: 31px;
  }
  .mypage {
    text-align: right;
    margin-right: 15px;
    margin-top: 10px;
  }
  .table-wrap {
    height: auto !important;
    line-height: normal !important;
  }

  .undone,
  .completed,
  .pause {
    margin-right: 12px;
    width: 80px;
    height: 24px;
    border-radius: 2px;
    font-size: 14px;
  }
  .undone {
    background: rgba(5, 168, 250, 1);
  }

  .completed {
    background: rgba(204, 204, 204, 1);
  }

  .pause {
    background: rgba(243, 75, 29, 1);
  }
  .ivu-col-span-3,
  .ivu-col-span-4 {
    margin-top: 16px;
    display: inline-flex;
    line-height: 24px;
  }

  .basicTips {
    margin: 10px 0 0 16px;
    font-size: 20px;
    color: rgba(51, 51, 51, 1);
    span {
      font-size: 16px;
      margin-left: 10px;
    }
  }
  .P_tree {
    float: left;
    width: 95%;
    height: 100%;
    margin: 14px 0 0 16px;
  }
}
</style>

<style lang="less">
.YJT-Gantte-Data1 {
  border-radius: 2px;
  height: 25px;
}
.YJT-ProgressTree-Item1 {
  text-align: left;
  width: 95px !important;
}
</style>