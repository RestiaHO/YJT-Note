import dialog from "@/libs/dialog";

const addMethodCommon = (caller, formRefs, apiMethod, callback) => {
  caller.$refs["" + formRefs + ""].validate(valid => {
    if (!valid) {
      return;
    }
    apiMethod
      .then(res => {
        if (res.data.code !== 200) {
          dialog.error(res.data.msg);
          return;
        } else if (res.data.code === 200) {
          dialog.success("添加成功");
          dialog.closeModal(caller);
          if ((typeof callback === 'function') && callback !== null) {
            callback();
          }
        }
      })
      .catch(err => {
        dialog.error(err);
      });
  });
};

const deleteMethodCommon = (selection, confirmText, apiMethod, callback) => {
  if (dialog.checkDialog(selection)) {
    dialog.confirm(confirmText, function () {
      apiMethod()
        .then(res => {
          if (res.data.code !== 200) {
            dialog.error(res.data.msg);
            return;
          }
          dialog.success("删除成功");
          if ((typeof callback === 'function') || callback !== null) {
            callback();
          }
        })
        .catch(err => {
          dialog.error(err);
        });
    });
  }
};

const editMethodCommon = (caller, formRefs, apiMethod) => {
  caller.$refs["" + formRefs + ""].validate(valid => {
    if (valid) {
      apiMethod
        .then(res => {
          if (res.data.code !== 200) {
            dialog.error(res.data.msg);
            return;
          }
          dialog.success("修改成功");
          dialog.closeModal(caller);
        })
        .catch(err => {
          dialog.error(err);
        });
    }
  });
};

const apiMethodAPI = {
  addMethodCommon,
  deleteMethodCommon,
  editMethodCommon
};

export default apiMethodAPI;
