import iView from 'iview'
import Vue from 'vue'

/**
 * 普通信息提示
 * @param {*} text 普通信息
 * @param {*} onclose 关闭弹框后的回调事件
 */
const info = (text, onclose) => {
  iView.Message.info({
    content: text,
    onClose: onclose
  })
}

/**
 * 成功信息提示
 * @param {*} text 成功信息
 * @param {*} onclose 关闭弹框后的回调事件
 */
const success = (text, onclose) => {
  iView.Message.success({
    content: text,
    onClose: onclose
  })
}

/**
 * 警告信息提示
 * @param {*} text 警告信息
 * @param {*} onclose 关闭弹框后的回调事件
 */
const warning = (text, onclose) => {
  iView.Message.warning({
    content: text,
    onClose: onclose
  })
}

/**
 * 错误信息提示
 * @param {*} text 错误信息
 * @param {*} onclose 关闭弹框后的回调事件
 */
const error = (text, onclose) => {
  iView.Message.error({
    content: text,
    onClose: onclose
  })
}

/**
 * 加载中
 * @param {*} text 加载内容
 * @param {*} onclose 关闭弹框后的回调事件
 */
const loading = (text, onclose) => {
  iView.Message.loading({
    content: text,
    onClose: onclose
  })
}

/**
 * 弹出成功提示
 * @param {*} title 标题
 * @param {*} text 成功提示内容
 * @param {*} onclose 关闭弹框后的回调事件
 */
const alertSuccess = (title, text, onclose) => {
  if (typeof (text) === 'function') {
    onclose = text
  }
  if (text === undefined || typeof (text) === 'function') {
    text = title
    title = '系统提示'
  }
  iView.Modal.info({
    title: title,
    content: text
  })
}

/**
 * 弹出错误提示
 * @param {*} title 标题
 * @param {*} text 错误提示内容
 * @param {*} onclose 关闭弹框后的回调事件
 */
const alertError = (title, text, onclose) => {
  if (typeof (text) === 'function') {
    onclose = text
  }
  if (text === undefined || typeof (text) === 'function') {
    text = title
    title = '系统提示'
  }
  iView.Modal.error({
    title: title,
    content: text
  })
}

/**
 * 弹出消息提示
 * @param {*} title 标题
 * @param {*} text 消息内容
 * @param {*} onclose 关闭弹框后的回调事件
 */
const alertInfo = (title, text, onclose) => {
  if (typeof (text) === 'function') {
    onclose = text
  }
  if (text === undefined || typeof (text) === 'function') {
    text = title
    title = '系统提示'
  }
  iView.Modal.error({
    title: title,
    content: text
  })
}

/**
 * 弹出警告模态框
 * @param {*} title 提示标题
 * @param {*} text 提示文本
 * @param {*} onclose 关闭回调
 */
const alertWarning = (title, text, onclose) => {
  iView.Modal.warning({
    title: title || '系统提示',
    content: text
  })
}

/**
 * 弹出询问框
 * @param {*} text 询问文本
 * @param {*} onok 点击确定的回调事件
 * @param {*} onCancel 点击取消的回调事件
 */
const confirm = (text, onok, onCancel) => {
  var config = {
    title: '系统提示',
    content: text,
    onOk: onok,
    onCancel: onCancel ? onCancel : null
  }
  iView.Modal.confirm(config)
}

/**
 * 显示模态对话框
 * @param {*} componentModal 组件对象
 * @param {*} props 组件参数
 */
const modal = (componentModal, props) => {
  // 创建组件
  let ComponentModalcontroter = Vue.extend(componentModal)
  var dialog = new ComponentModalcontroter({
    props
  })
  for (var i in props) {
    dialog.$props[i] = props[i]
  }
  dialog.destroy = function () {
    this.$destroy()
    document.body.removeChild(this.$el)
  }
  const component = dialog.$mount() // 挂载组件
  document.body.appendChild(component.$el)
}

/**
 * 关闭模态对话框
 * @param {*} modal 模态对话框实例
 */
const closeModal = (modal) => {
  modal.$children[0].visible = false
  if (typeof modal.callback === 'function') {
    modal.callback()
  }
}

/**
 * 用户选择模态对话框
 * @param {*} selectRow 用户选择的行数据
 */
const checkDialog = (selectRow) => {
  if (Array.isArray(selectRow)) {
    if (
      selectRow.length === undefined &&
      selectRow.length === 0 &&
      selectRow.length !== 1
    ) {
      iView.Modal.warning({
        title: '系统提示',
        content: '<h4>只能选择一行数据</h4>'
      })
      return false
    }
    return true
  } else {
    if (selectRow !== "" && selectRow !== null) {
      iView.Modal.warning({
        title: '系统提示',
        content: '<h4>只能选择一行数据</h4>'
      })
      return false
    }
    return true;
  }
}

export default {
  info,
  success,
  warning,
  error,
  loading,
  modal,
  closeModal,
  alertSuccess,
  alertError,
  alertWarning,
  alertInfo,
  confirm,
  checkDialog
}
