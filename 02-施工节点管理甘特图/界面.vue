<template>
  <div id="constructeNode">
    <span class="title">施工节点管理</span>
    <Row>
      <Col span="14">
        <!-- 1. 通过给目标div一个class名，后面将对这个class来制作时间轴 -->
        <div class="P_gatte"></div>
      </Col>
    </Row>
  </div>
</template>

<script>
import $ from "jquery";
import storage from "@/libs/storage.js";
import dayjs from "dayjs";
import projectManageAPI from "@/api/projectManage.js";
import apiMethod from "@/libs/GeneralOperation.js";
import AddNodeModal from "./addNodeModal.vue";
import EditNodeModal from "./editNodeModal.vue";
import { setTimeout } from "timers";
import dialog from "@/libs/dialog.js";
import peopleManageAPI from "@/api/peopleManage.js";

export default {
  data() {
    return {
      gatteModel: null, // 甘特图对象
      gatteArr: [], // 甘特图时间数据源
      timeInterval: "month", // 时间刻度
      nodePageTotal: 0,
      progressPageTotal: 0,
      startTime: "", // 计划开始日期
      endTime: "", // 计划结束日期
      loading: true,
      nodeLoading: true,
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
          title: "节点名称",
          key: "n_name",
          tooltip: true
        },
        {
          title: "开始时间",
          key: "n_startTime",
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
          tooltip: true,
          render: (h, params) => {
            return h("span", dayjs(params.row.n_endTime).format("YYYY-MM-DD"));
          }
        },
        {
          title: "是否完成",
          key: "n_isacc",
          tooltip: true,
          render: (h, params) => {
            let text = "";
            switch (params.row.n_isacc) {
              case -1:
                text = "暂停";
                break;
              case 0:
                text = "未完成";
                break;
              case 1:
                text = "已完成";
                break;
            }
            return h("span", text);
          }
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
                      this.EditNodeByID(params.row);
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
                      this.DelNodeByNID(params.row);
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
    let menuId = "M67DJDI7";
    peopleManageAPI
      .getProPeoPower(
        storage.get("pid"),
        storage.get("cid"),
        storage.get("proId"),
        menuId
      )
      .then(res => {
        if (res.data.code == 200) {
          console.log(res.data);
        } else {
          dialog.error(res.data.msg);
        }
      });
    this.getNodeList();
  },
  methods: {
    currentChange(currentRow, oldCurrentRow) {
      this.nodeData[0]._highlight = false;
    },
    GatteList(item) {
      //div,showType,from,to,Datas:[{from,to,..,color..id}],click({data}),scrollY(top),scrollX(left),className...,groupWidth,maxHeight,dataHeight,//month,day,hour,minute,second

      ////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////
      // 2.1 首先获取时间（初始&结束）、默认模式（月/日）
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
          '<div style="float:left;width:50px;height:100%;"><table cellSpacing="0" cellPadding="0" border="0" style="table-layout:fixed;margin:0px;padding:0px;width:100%;height:100%;"><tr style="height:120px;" valign="bottom"><td><div style="float:left;width:50px;height:20px;background-color:#464B54;border:1px solid #1F242F;cursor:pointer;" class="btnUp"><div style="background-image:url(arrowUp.png);width:20px;height:10px;;margin-left:auto;margin-right:auto;margin-top:5px;"></div></div></td></tr><tr style="height:100%;" valign="top"><td><div style="float:left;width:50px;height:100%;max-height:100%;overflow-y:scroll;" class="hiddenScroll dataList">';
        for (var i = 0; i < item.Datas.length; i++) {
          html +=
            '<div style="float:left;width:50px;height:50px;cursor:pointer;background-image:url(' +
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
          '</div></td></tr><tr style="height:120px;" valign="top"><td><div style="float:left;width:50px;height:20px;background-color:#464B54;border:1px solid #1F242F;cursor:pointer;" class="btnDown"><div style="background-image:url(arrowDown.png);width:20px;height:10px;;margin-left:auto;margin-right:auto;margin-top:5px;"></div></div></td></tr></table></div>';
        html +=
          '</td></tr></table><div class="btnClose" style="background-image:url(close.png);width:32px;height:32px;top:0px;right:0px;position:absolute;cursor:pointer;"></div>';

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
    // 根据节点id编辑节点
    EditNodeByID(nModel) {
      let that = this,
        startTime = that.startTime,
        endTime = that.endTime;
      dialog.modal(EditNodeModal, {
        callback() {
          that.getNodeList();
        },
        nModel,
        startTime,
        endTime
      });
    },
    // 弹出添加节点模态框
    addNodeEvent() {
      let that = this,
        startTime = that.startTime,
        endTime = that.endTime;
      dialog.modal(AddNodeModal, {
        callback() {
          that.getNodeList();
        },
        startTime,
        endTime
      });
    },
    // 根据节点id删除节点
    DelNodeByNID(row) {
      let that = this;
      apiMethod.deleteMethodCommon(
        [row.n_id],
        "您真的要删除该节点吗？",
        onOK => {
          // 因为这里是个Promise对象 所以必须要返回
          return projectManageAPI.getDelNode(row.n_id);
        },
        onCancel => {
          return that.getNodeList();
        }
      );
    },
    // 获取节点表格数据
    getNodeList() {
      this.loading = true;
      let _this = this;
      _this.progressData = [];
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
              _this.nodeData = JSON.parse(JSON.stringify(data));
              _this.progressData = JSON.parse(JSON.stringify(data));
              _this.nodeData[0]._highlight = true;

              let colorFinish = "#CCCCCC",
                colorStop = "#F34B1D",
                colorNoFinish = "#05A8FA";

              _this.progressData.forEach(item => {
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

              _this.$nextTick(() => {
                _this.initGatte();
                _this.changeTimeInterval(_this.timeInterval);
              });

              setTimeout(() => {
                $("#nodeTable .ivu-table-overflowY").scroll(function() {
                  _this.gatteModel.ScrollYTo(
                    $("#nodeTable .ivu-table-overflowY")[0].scrollTop
                  );
                });
              }, 0);
              _this.nodePageTotal = res.data.datas.length;
              _this.progressPageTotal = res.data.datas.length;
            } else {
              this.$nextTick(() => {
                this.initGatte();
                this.changeTimeInterval(this.timeInterval);
              });
            }
          }
        });

      _this.loading = false;
      _this.nodeLoading = false;
    },
    initGatte() {
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      // 2. 在方法中创建一个 甘特图 构造函数 `GatteList`，该构造函数通过js代码生成dom（html）标签
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
          this.gatteModel.ScrollTo(data);
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
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../../plugin/Page/page.css";

#constructeNode {
  width: 100%;
  .title {
    font-size: 22px;
    font-weight: 400;
    padding-top: 10px;
    display: block;
    margin-right: 33px;
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
}
</style>

<style lang="less">
.YJT-Gantte-Data1 {
  border-radius: 2px;
  height: 25px;
}
// .contentScroll {
//   height: 230px !important;
// }
</style>