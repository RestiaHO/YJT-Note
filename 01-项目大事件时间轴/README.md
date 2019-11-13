时间轴的实现：
## 1. 通过给目标div一个class名，后面将对这个class来制作时间轴

## 2. 在方法中创建一个 时间轴 构造函数 `ProgressTree`，该构造函数通过js代码生成dom（html）标签
#### 2.1 首先设置了css样式属性

#### 2.2 循环需要在页面上展示的Data数据源

## 3. 对目标class 傅予以上 html 
#### 3.1 jQuery 的 find() 方法,搜索所有段落中的后代 "xxx" 元素;
    例如： $("p").find("span").css('color','red');
    例如： $("p").find("span").click(function() {});

#### 3.2 jQuery 的 prev() 方法, 检索每一个段落，找到类名为 "xxx" 的前一个元素;
    例如：$("p").prev(".selected")

#### 3.3 jQuery 的 hasClass() 方法，检查第一个 元素 是否包含 "xxx" 类：

#### 3.4 jQuery 的 height() 方法，返回元素高度：

#### 3.5 jQuery 的 scrollTop() 方法，设置 元素 中滚动条的垂直偏移：
    例如：$("div").scrollLeft(100);

## 4. vue.$nextTick()
     $nextTick 是在下次 DOM 更新循环结束之后执行延迟回调，在修改数据之后使用 $nextTick，则可以在回调中获取更新后的 DOM
