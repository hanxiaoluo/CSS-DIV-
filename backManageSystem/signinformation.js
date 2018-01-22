var wsUri = "ws://localhost:23323";
var websocket = null;

var aa = null;
var PageNo;
var InTb;
var Fp;
var Nep;
var Prp;
var Lp;
var S1;
var S2;
var currentPage;                                                //定义变量表示当前页数
var SumPage;                                                    //定义变量表示总页数

// ArrayBuffer转为字符串，参数为ArrayBuffer对象.传图片超出内存
// function ab2str(buf) {
//     return String.fromCharCode.apply(null, new Uint16Array(buf));
// }
// 字符串转为ArrayBuffer对象，参数为字符串
function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 每个字符占用2个字节
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//ArrayBuffer转为字符串，参数为ArrayBuffer对象
function ab2str(buf) {
    var str = "";
    var ab = new Uint16Array(buf);
    var abLen = ab.length;
    var CHUNK_SIZE = Math.pow(2, 16);
    var offset, len, subab;
    for (offset = 0; offset < abLen; offset += CHUNK_SIZE) {
        len = Math.min(CHUNK_SIZE, abLen-offset);
        subab = ab.subarray(offset, offset+len);
        str += String.fromCharCode.apply(null, subab);
    }
    return str;
}

var personlist = new List();
var newTotalList = new List;
var allorinquire = true;

function initWebSocket() {
    try {
            if (typeof MozWebSocket == 'function')
                WebSocket = MozWebSocket;
            if ( websocket && websocket.readyState == 1 )
                websocket.close();
            websocket = new WebSocket( wsUri );
            
            websocket.onopen = function (evt) {
                console.log("CONNECTED");
                sendMessage("web_selectAll");
            };
            websocket.onclose = function (evt) {
                console.log("DISCONNECTED");
            };
            //监听消息
            websocket.binaryType = 'arraybuffer';
            websocket.onmessage = function (evt) {
                aa = evt.data;
                if(typeof(aa) != "string")
                {
                    var data = ab2str(aa);
                    analysisString(data);
                    //console.log("Message received personlist -=",personlist);
                    Fponclick();
                }
                else 
                {
                    console.log("aa =",aa);
                    if(aa == "insert" || aa == "web_update" || aa =="web_delete")
                    {
                        personlist.clear();
                        allorinquire = true;
                        pIndex = 0;
                        sendMessage("web_selectAll");
                        console.log("web_selectAll ===",personlist);
                        console.log("allorinquire =",allorinquire);
                    }   
                }
            }
            websocket.onerror = function (evt) {
                console.log("ERROR: " + evt.data);
            };
        } catch (exception) {
            console.log("ERROR: " + exception);
        }
}

//初始化websocket
window.onload = function (){
    
    //分页显示
    PageNo=document.getElementById('PageNo');                   //设置每页显示行数
    //console.log("pageno =",PageNo);
    InTb=document.getElementById('table');                      //表格
    Fp=document.getElementById('F-page');                       //首页
    Nep=document.getElementById('Nex-page');                    //下一页
    Prp=document.getElementById('Pre-page');                    //上一页
    Lp=document.getElementById('L-page');                       //尾页
    S1=document.getElementById('s1');                           //总页数
    S2=document.getElementById('s2');                           //当前页数

    initWebSocket();
};
//发送命令
function sendMessage(message) 
{
    if ( websocket != null )
    {
        websocket.send( message );
        //console.log( "message sent :", '"'+message+'"' );
    }
}

var pIndex = 0;
//解析后台返回的字符串
function analysisString(text)
{
    //console.log("analysisString text =",text);


        var json = JSON.parse(text);
        // if(!json.hasOwnProperty("operateType") || (json.hasOwnProperty("operateType") && json.operateType == "web_interposition"))//
        // {
        //console.log("hasOwnProperty =",json.hasOwnProperty("type"));
        var id = json.id;
        var name = json.name;
        var gender = json.gender;
        var type = json.personType;
        var company = json.company;
        var job = json.job;
        var phone = json.phone;
        var signCode = json.signCode;
        var eigenValue = json.eigenValue;
        var photo = json.photo; 
        pIndex++;

        var person = new Person(id,name,gender,company,job,phone,type,signCode,eigenValue,photo,pIndex);
        //console.log("person =")
        //
        personlist.append(person);
        // }


}

var Person = function (personId,personName,personGender,personCompany,personJob,personPhone,personType,personSignCode,personEigenValue,personPhoto,personIndex) {
    this.personId = personId;  //记录的是库中的id
    this.personName = personName;  
    this.personGender = personGender;  
    this.personType = personType;
    this.personCompany = personCompany;
    this.personJob = personJob;
    this.personPhone = personPhone;
    this.personSignCode = personSignCode;
    this.personEigenValue = personEigenValue;
    this.personPhoto = personPhoto; 
    this.personIndex = personIndex;//记录的是序号
} 
//人员操作类型(注册、更新、删除)
var PersonHandle = function(handleType,person)
{
    this.handleType = handleType;
    this.person = person;
} 

function List() {
        this.listSize = 0;
        this.pos = 0;
        this.dataStore = [];//创建一个空数组保存列表的元素
        this.clear = clear;
        this.find = find;
        // this.toString = toString;
        // this.insert = insert;
        this.append = append;
        // this.remove = remove;
        //this.front = front;
        // this.end = end;
        // this.prev = prev;
        // this.next = next;
        //this.length = length;
        // this.currPos = currPos;
        this.update = update;
        this.moveTo = moveTo;
        this.inquire = inquire;
        this.getElement = getElement;
        //this.contains = contains;
}
//添加
function append(element) 
{
    this.dataStore[this.listSize++] = element;
}
//将第一个元素设置为当前元素
// function front() {
//     this.pos = 0;
// }
//将当前位置移动到指定位置
function moveTo(position) 
{
    this.pos = position;
}
//条件检索
function inquire(item,condition,/*signintype,*/peopletype/*,robot*/)
{
    var node = item;
    if(condition!="" && condition!=item.personName && condition!=item.personPhone /*&& condition!=item.personSignCode*/ && condition!=item.personCompany && condition!=item.personJob)
    {
        node = "";
        return node;
    }
    if(peopletype!="all-people" && peopletype!=item.personType)
    {
        node = "";
        return node;
    }
    // if(signintype!="all-signin" && signintype!=item.signintype) 
    // {
    //     node = "";
    //     return node;
    // }
    // if(robot!="all-robot" && robot!=item.robot)
    // {
    //     node = "";
    //     return node;
    // }
    return node;
}
//返回当前位置的元素
function getElement() 
{
    return this.dataStore[this.pos]
}
//清空
function clear()
{
    delete this.dataStore;
    this.dataStore = [];
    this.listSize = this.pos = 0;
}
//查找
function find(element)
{
    for (var i = 0;i < this.dataStore.listSize; ++i) {
        if (this.dataStore[i] == element) {
            return i;
        }
    }
    return -1;
}
//替换
function update(index,element)
{
    this.dataStore[index-1] = element;
    //console.log("this.dataStore[index-1] =",element);
}
//退出
function onBtnQuitClick()
{
    //退出 界面跳转到login.html
    var temp = confirm("是否确认退出？");
    if(temp)
    {
        window.location.href="login.html";
    }
}
//刷新
function onBtnRefreshClick()
{
    //刷新 重新加载界面中table中的所有行、列
    document.location.reload();
}

function onBtnSituationClick()
{
    //document.getElementById("btn-signlist").focus(); 
    alert("实时概况模块暂不可用！");
}

function onBtnDataAnalyzeClick()
{
    alert("数据分析模块暂不可用！");
    //document.getElementById("btn-signlist").focus(); 
}
//信息录入,注册
function onBtnImportClick()
{
    //信息录入 重新创建一个div（涉及界面）
    var importid = document.getElementById("information-import");
    
    var infoid = document.getElementById("signinformation");
    importid.style.display="block";
    infoid.style.display="block";

    document.getElementById("import-name").value = "";
    document.getElementById("import-company").value = "";
    document.getElementById("import-job").value = "";
    document.getElementById("import-tel").value = "";
    document.getElementById("import-signValue").value = "";
    document.getElementById("preview").src = "";

    document.getElementById("import-name-error").style.display = "none";
    document.getElementById("import-tel-error").style.display = "none";
    document.getElementById("import-company-error").style.display = "none";
    document.getElementById("import-job-error").style.display = "none";
    document.getElementById("import-signcode-error").style.display = "none";
    
    //sweetAlert("Hello world!");
    //window.location.href="infoinput.html";
}
 
//图片转化为base64
function getBase64Image(img) {  
    var canvas = document.createElement("canvas");  
    canvas.width = img.width;  
    canvas.height = img.height;  
    var ctx = canvas.getContext("2d");  
    ctx.drawImage(img, 0, 0, img.width, img.height);  
    var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();  
    var dataURL = canvas.toDataURL("image/"+ext);  
    return dataURL;  
}

//base64转化为图片保存
function getImageFromBase64()
{

}

function importnameErrorHide()
{
    var nameid = document.getElementById("import-name");
    var bnamelegal = /^([\u4e00-\u9fa5]{2,5}|[A-Za-z]{4,10})$/.test(nameid.value.replace(/^\s+|\s+$/g, ""));
    //console.log("bnamelegal =",bnamelegal);
    if(bnamelegal)
        document.getElementById("import-name-error").style.display = "none";
}

function importtelErrorHide()
{
    var telid = document.getElementById("import-tel");
    var btellegal = /^1(3|4|5|7|8)\d{9}$/.test(telid.value);
    if(btellegal)
        document.getElementById("import-tel-error").style.display = "none";
}
//信息录入----确认按钮
function onBtnImportSureClick()
{
    //console.log("onBtnImportSureClick clicked");
    var nameid = document.getElementById("import-name");
    var telid = document.getElementById("import-tel");
    var companyid = document.getElementById("import-company");
    var jobid = document.getElementById("import-job");
    var signcodeid = document.getElementById("import-signValue");

    var bnamelegal = /^([\u4e00-\u9fa5]{2,5}|[A-Za-z]{4,10})$/.test(nameid.value.replace(/^\s+|\s+$/g, ""));
    var btellegal = /^1(3|4|5|7|8)\d{9}$/.test(telid.value);

    var bcompany = true;
    if(companyid.value != "")
        bcompany = /^([\u4e00-\u9fa5]{2,15}|[A-Za-z]{4,30})$/.test(companyid.value.replace(/^\s+|\s+$/g, ""));
    var bjob = true;
    if(jobid.value != "")
        bjob = /^([\u4e00-\u9fa5]{2,15}|[A-Za-z]{4,30})$/.test(jobid.value.replace(/^\s+|\s+$/g, ""));
    var bsigncode = true;
    if(signcodeid.value != "")
        bsigncode = /^[0-9]{2,11}$/.test(signcodeid.value);

    if( !bnamelegal || nameid.value=="")
    {
        document.getElementById("import-name-error").innerHTML="姓名应为4-10个字符或2-5个汉字";
        document.getElementById("import-name-error").style.display = "block";
    }
    if( !btellegal || telid.value=="")
    {
        document.getElementById("import-tel-error").innerHTML="请输入正确的11位手机号";
        document.getElementById("import-tel-error").style.display = "block";
    }
    if(!bcompany /*|| companyid.value==""*/)
    {
        document.getElementById("import-company-error").innerHTML="公司应为4-30个字符或2-15个汉字";
        document.getElementById("import-company-error").style.display = "block";
    }
    if(!bjob /*|| jobid.value==""*/)
    {
        document.getElementById("import-job-error").innerHTML="职位应为4-30个字符或2-15个汉字";
        document.getElementById("import-job-error").style.display = "block";
    }
    if(!bsigncode /*|| signcodeid.value == ""*/)
    {
        document.getElementById("import-signcode-error").innerHTML="签到码必须是2-11位数字";
        document.getElementById("import-signcode-error").style.display = "block";
    }
    if(bnamelegal && btellegal && bcompany && bjob &&bsigncode)
    {


        // document.getElementById("import-name-error").innerHTML="";
        // document.getElementById("import-tel-error").innerHTML="";
        //获取其他输入项的值，进行信息的录入
        //console.log("onBtnImportSureClick1111 clicked");
        var newPerson = new Person;
        //name,gender,personType,company,job,phone,signCode,eigenValue
        newPerson.personName = document.getElementById("import-name").value;
        newPerson.personGender = document.getElementById("import-sex").value;
        newPerson.personType = document.getElementById("import-people-type").value;
        newPerson.personCompany = document.getElementById("import-company").value;
        newPerson.personJob = document.getElementById("import-job").value;
        newPerson.personPhone = document.getElementById("import-tel").value;
        newPerson.personSignCode = document.getElementById("import-signValue").value
        newPerson.personPhoto = document.getElementById('preview').src;

        //var needUpdatePerInfo;
        var personHandle = new PersonHandle("web_interposition",newPerson);
        var json = JSON.stringify(personHandle);  

        //var json = JSON.stringify(newPerson);  
        //console.log(json);

        sendMessage(json);
        onBtnCloseClick();
        // + newPerson.name + newPerson.gender + newPerson.personType +newPerson.company 
        // + newPerson.job + newPerson.phone + newPerson.signCode + newPerson.photo 
        // personlist.append(newPerson);
        // console.log("personlist =",personlist);
        // var importid = document.getElementById("information-import");
        // importid.style.display="none";

        //onBtnRefreshClick();
        //setTimeout(onBtnRefreshClick, 3000);
    }                
}
//注册页面选择照片预览
function onUploadPictureChanged(obj) {
    //getPath(obj);
    var faceImg = null;//图片转化base64数据
    //console.log("wocao...");
    var file = obj.files[0];
    
    if(typeof(file) != "undefined")
    {
        //判断类型是不是图片  
        if(!/image\/\w+/.test(file.type)){     
            alert("请确保文件为图像类型");   
            return false;   
        }   
        var reader = new FileReader();   
        reader.readAsDataURL(file);   
        reader.onload = function(e){   
            document.getElementById('preview').src=this.result;
            faceImg = this.result;
            //alert(this.result); //就是base64  
        }  
    }
}

function getPath(obj)
{
    if(obj)
    {
        if (window.navigator.userAgent.indexOf("MSIE")>=1)
        {
            obj.select();
            return document.selection.createRange().text;
        }
        else if(window.navigator.userAgent.indexOf("Firefox")>=1  || window.navigator.userAgent.indexOf("Google")>=1)
        {
            if(obj.files)
            {
                return obj.files.item(0).getAsDataURL();
            }
            return obj.value;
        }
        return obj.value;
    }
}

//编辑页面选择照片预览
function onEditUploadPictureChanged(obj) 
{
    //getPath(obj);
    var faceImg = null;//图片转化base64数据
    var file = obj.files[0]; 
    document.getElementById('edit-preview').src="";
    //console.log("file =",file);
  
    if(typeof(file) != "undefined")
    {
        //判断类型是不是图片  
        if(!/image\/\w+/.test(file.type)){     
            alert("请确保文件为图像类型");   
            return false;   
        }   
        // if(!/.(jpg | jpeg |JPG |JPEG)$/.test(file.type))
        // {     
        //     alert("请确保文件为JPEG类型");   
        //     return false;   
        // }   
        var reader = new FileReader();   
        reader.readAsDataURL(file);   
        reader.onload = function(e){   
            document.getElementById('edit-preview').src=this.result;
            faceImg = this.result;
            //alert(this.result); //就是base64  
        }  
    }
}

//
//注册页面关闭
function onBtnCloseClick()
{
    //console.log("#######################################");
    onBtnImportCancelClick();
}

//编辑页面关闭
function onEditBtnCloseClick()
{
    onBtnEditCancelClick();
}

function onBtnImportCancelClick()
{
    //信息录入----取消按钮
    var importid = document.getElementById("information-import");
    importid.style.display="none";
}
function onBtnExportClick()
{
    //信息导出 重新创建一个div（涉及界面）
    // var exportid = document.getElementById("information-export");
    // exportid.style.display="block"; 
    alert("导出功能暂不可用！");   
}
function onBtnExportSureClick()
{
    //信息导出----确认按钮----导出一个pdf格式的文件
    var exportid = document.getElementById("information-export");
    exportid.style.display="none";    
}
function onBtnExportCloseClick()
{
    //信息导出----关闭按钮
    var exportid = document.getElementById("information-export");
    exportid.style.display="none";    
}
//条件查询
function onBtnInquireClick()
{
    //查询 获取各个条件的值，&&查询并显示
    //name、tel、qrcode、company、job，sign-type，people-type，robot
    var condition = document.getElementById("condition").value;
    //var signintype = document.getElementById("signin-type").value;
    var peopletype = document.getElementById("people-type").value;
    //var robot = document.getElementById("robot").value;
    // personlist.front();
    // var currNode = personlist.getElement();
    // console.log("currNode =",currNode);

    var table = document.getElementById("table");
    var rownum = table.rows.length;//11
    for (var i=1;i<rownum;i++)
    {
        table.deleteRow(i);
        rownum=rownum-1;
        i=i-1;
    }
    
    //console.log("条件查询。。。");

    newTotalList.clear();
    allorinquire = false;

    for(var i=0; i<personlist.listSize; i++)
    {
        var currNode = personlist.dataStore[i];
        //console.log("currNode =",currNode);
        var item = personlist.inquire(currNode,condition,peopletype);
        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%111111");
        if(item!="")
        {
            //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%2222");
            // var tempitem = item; 
            // var newrow = table.insertRow();
            // // newrow.onclick=function(){onRowEditClick(table.rows.length-1,this,totallist.getelement(i))}; 
            // // var newcell1 = newrow.insertCell();
            // // newcell1.innerHTML=(table.rows.length-1);
            // var newcell2 = newrow.insertCell();
            // newcell2.innerHTML=item.name;
            // var newcell3 = newrow.insertCell();
            // newcell3.innerHTML=item.gender;
            // var newcell4 = newrow.insertCell();
            // newcell4.innerHTML=item.personType;
            // var newcell5 = newrow.insertCell();
            // newcell5.innerHTML=item.company;
            // var newcell6 = newrow.insertCell();
            // newcell6.innerHTML=item.job;
            // var newcell7 = newrow.insertCell();
            // newcell7.innerHTML=item.phone;
            // var newcell8 = newrow.insertCell();
            // newcell8.innerHTML=item.signCode;  
            // var newcell9 = newrow.insertCell();
            // newcell9.innerHTML=item.eigenValue;
            // var newcell10 = newrow.insertCell();
            // newcell10.innerHTML=item.photo;
            newTotalList.append(item);
        }
        else if(item == "")
        {
            console.log("item is null...");
        }
    }

    Fponclick();
    //console.log("newTotalList =",newTotalList);
}
//重置,把各个查询条件初始化
function onBtnResetClick()
{
    document.getElementById("condition").value="";
    document.getElementById("signin-type").value="all-signin";
    document.getElementById("people-type").value="all-people";
    //document.getElementById("robot").value="all-robot";
}

//编辑页面姓名提示隐藏
function editnameErrorHide()
{
    var nameid = document.getElementById("edit-name");
    var bnamelegal = /^([\u4e00-\u9fa5]{2,5}|[A-Za-z]{4,10})$/.test(nameid.value.replace(/^\s+|\s+$/g, ""));
    if(bnamelegal)
        document.getElementById("edit-name-error").style.display = "none";
}
//编辑页面手机提示隐藏
function edittelErrorHide()
{
    var telid = document.getElementById("edit-tel");
    var btellegal = /^1(3|4|5|7|8)\d{9}$/.test(telid.value);
    if(btellegal)
        document.getElementById("edit-tel-error").style.display = "none";
}

//编辑页面保存
var clickedRowDbid = 0;
var clickedRowIndex = 0;
function onBtnEditSaveClick()
{
    var nameid = document.getElementById("edit-name");
    var telid = document.getElementById("edit-tel");
    var companyid = document.getElementById("edit-company");
    var jobid = document.getElementById("edit-job");
    var signcodeid = document.getElementById("edit-qrcode");

    var bnamelegal = /^([\u4e00-\u9fa5]{2,5}|[A-Za-z]{4,10})$/.test(nameid.value.replace(/^\s+|\s+$/g, ""));
    var btellegal = /^1(3|4|5|7|8)\d{9}$/.test(telid.value);
    var bcompany = true;
    if(companyid.value != "")
        bcompany = /^([\u4e00-\u9fa5]{2,15}|[A-Za-z]{4,30})$/.test(companyid.value.replace(/^\s+|\s+$/g, ""));
    var bjob = true;
    if(jobid.value != "")
        bjob = /^([\u4e00-\u9fa5]{2,15}|[A-Za-z]{4,30})$/.test(jobid.value.replace(/^\s+|\s+$/g, ""));
    var bsigncode = true;
    if(signcodeid.value != "")
        bsigncode = /^[0-9]{2,11}$/.test(signcodeid.value);

    if( !bnamelegal || nameid.value=="")
    {
        document.getElementById("edit-name-error").innerHTML="姓名应为4-10个字符或2-5个汉字";
        document.getElementById("edit-name-error").style.display = "block";
    }
    if( !btellegal || telid.value=="")
    {
        document.getElementById("edit-tel-error").innerHTML="请输入正确的11位手机号";
        document.getElementById("edit-tel-error").style.display = "block";
    }
    if(!bcompany )
    {
        document.getElementById("edit-company-error").innerHTML="公司应为4-30个字符或2-15个汉字";
        document.getElementById("edit-company-error").style.display = "block";
    }
    if(!bjob)
    {
        document.getElementById("edit-job-error").innerHTML="职位应为4-30个字符或2-15个汉字";
        document.getElementById("edit-job-error").style.display = "block";
    }
    if(!bsigncode)
    {
        document.getElementById("edit-signcode-error").innerHTML="签到码必须是2-11位数字";
        document.getElementById("edit-signcode-error").style.display = "block";
    }
    if(bnamelegal && btellegal && bcompany && bjob &&bsigncode)
    {
        var needUpdatePerson = new Person;
        //console.log("clickedRowDbid =",clickedRowDbid);
        needUpdatePerson.personId = clickedRowDbid;
        needUpdatePerson.personName = document.getElementById("edit-name").value;
        needUpdatePerson.personGender = document.getElementById("edit-sex").value;
        needUpdatePerson.personCompany = document.getElementById("edit-company").value;
        needUpdatePerson.personJob = document.getElementById("edit-job").value;
        needUpdatePerson.personPhone = document.getElementById("edit-tel").value;
        needUpdatePerson.personType = document.getElementById("edit-peopletype").value;
        needUpdatePerson.personSignCode = document.getElementById("edit-qrcode").value;
        // needUpdatePerson.personEigenValue = document.getElementById("edit-robot").value;
        needUpdatePerson.personPhoto = document.getElementById("edit-preview").src;
        needUpdatePerson.personIndex = clickedRowIndex;

        personlist.update(clickedRowIndex,needUpdatePerson);

        var personHandle = new PersonHandle("web_update",needUpdatePerson);
        var json = JSON.stringify(personHandle);  
        sendMessage(json);

        onBtnEditCancelClick();
    }
}

//编辑页面删除
function onBtnEditDeleteClick()
{
    swal({
        title: '你确定继续进行删除操作吗?',
        //text: 'You will not be able to recover this imaginary file!',
        type: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then(function(isConfirm) {
        if (isConfirm === true) {
            var needDeletePerson = new Person;
            //console.log("delete clickedRowDbid =",clickedRowDbid);
            needDeletePerson.personId = clickedRowDbid;
        
            var personHandle = new PersonHandle("web_delete",needDeletePerson);
            var json = JSON.stringify(personHandle);  
            sendMessage(json);

            swal({
                title:'删除成功!',
                //'Your imaginary file has been deleted.',
                //'success'
                showConfirmButton: true,
                confirmButtonText: '确定',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(function(isChildConfirm){
                if(isChildConfirm == true)
                {
                    onBtnEditCancelClick();
                }
            });
        } else if(isConfirm === false) {
            console.log("%%%%%%%%%");
        } else {
            console.log("#############");
            // Esc, close button or outside click
            // isConfirm is undefined
        }
    }); 
}
//编辑页面取消
function onBtnEditCancelClick()
{
    var editid = document.getElementById("information-edit");
    editid.style.display="none";    
}
// function onCardEditClick()
// {
//     //编辑名片 重新创建一个div（涉及新界面）
//     var cardid = document.getElementById("card-edit");
//     cardid.style.display="block";
// }
//获取鼠标点击行的所有数据
function getData(element)
{
    var editid = document.getElementById("information-edit");
    var infoid = document.getElementById("signinformation");
    editid.style.display="block";
    infoid.style.display="block";

    document.getElementById("edit-name-error").style.display = "none";
    document.getElementById("edit-tel-error").style.display = "none";
    document.getElementById("edit-company-error").style.display = "none";
    document.getElementById("edit-job-error").style.display = "none";
    document.getElementById("edit-signcode-error").style.display = "none";

    var tds = element.cells;  
    var str = "you click ";  
    // for(var i = 0;i < 10;i++){  
    //     str = str + tds[i].innerHTML + "--";  
    // }  
    //console.log(element.personName,element.personCompany);
    //alert(str);  
    // var editid = document.getElementById("information-edit");
    // editid.style.display="block";
    // alert(row.cells[2].innerHTML);

    //id,name,gender,company,job,phone,type,signCode,eigenValue,photo
    clickedRowIndex = tds[0].innerHTML;//序号
    document.getElementById("edit-name").value=tds[1].innerHTML;
    if(tds[2].innerHTML=="男")
    {
        document.getElementById("edit-sex").value="male";
    }
    else
    {
        document.getElementById("edit-sex").value="female";
    }
    document.getElementById("edit-company").value=tds[3].innerHTML;
    document.getElementById("edit-job").value=tds[4].innerHTML;
    document.getElementById("edit-tel").value=tds[5].innerHTML;
    if(tds[6].innerHTML=="普通人员")
    {
        document.getElementById("edit-peopletype").value="general";
    }
    else if(tds[6].innerHTML=="特殊人员")
    {
        document.getElementById("edit-peopletype").value="special";
    }
    else if(tds[6].innerHTML=="VIP人员")
    {
        document.getElementById("edit-peopletype").value="vip";
    }
    document.getElementById("edit-qrcode").value=tds[7].innerHTML;
    // document.getElementById("edit-robot").value=tds[7].innerHTML;
    /*var img = new Image();
    var abc = tds[8].innerHTML;
    img.src = abc.slice(10,-25);
    document.getElementById("edit-preview").src=img.src;*/
    clickedRowDbid = tds[8].innerHTML;//库id
    //console.log("getData clickedRowDbid =",clickedRowDbid);
    

    // document.getElementById("edit-signintype").value=item.signintype;
    // document.getElementById("edit-signintime").value=item.signintime;
}

//首页
function Fponclick()
{
    //console.log("wcaocaocaocacoacoacoaoc",PageNo.value);
    if(PageNo.value !="")                                       //判断每页显示是否为空
    {
        InTb.innerHTML='';                                     //每次进来都清空表格
        S2.innerHTML='';                                        //每次进来清空当前页数
        currentPage=1;                                          //首页为1
        S2.appendChild(document.createTextNode(currentPage));
        S1.innerHTML='';                                        //每次进来清空总页数

        var totallist = null;
        if(allorinquire)
            totallist = personlist;
        else
            totallist = newTotalList;

        //console.log("personlist =",personlist);
        //console.log("newTotalList =",newTotalList);
        //console.log("totallist =",totallist);
        
        if((totallist.listSize)%PageNo.value==0)                    //判断总的页数
        {
            SumPage=parseInt((totallist.listSize)/PageNo.value);
            //console.log("SumPage1 =",totallist.listSize,PageNo.value,SumPage);
        }
        else
        {
            SumPage=parseInt((totallist.listSize)/PageNo.value)+1
            //console.log("SumPage2 =",totallist.listSize,PageNo.value,SumPage);
        }
        S1.appendChild(document.createTextNode(SumPage));
        var oTBody=document.createElement('tbody');               //创建tbody
        oTBody.setAttribute('class','In-table');                  //定义class
        oTBody.insertRow(0);

        oTBody.rows[0].insertCell(0);
        oTBody.rows[0].cells[0].appendChild(document.createTextNode('序号'));
        oTBody.rows[0].insertCell(1);
        oTBody.rows[0].cells[1].appendChild(document.createTextNode('姓名'));
        oTBody.rows[0].insertCell(2);
        oTBody.rows[0].cells[2].appendChild(document.createTextNode('性别'));
        oTBody.rows[0].insertCell(3);
        oTBody.rows[0].cells[3].appendChild(document.createTextNode('公司'));
        oTBody.rows[0].insertCell(4);
        oTBody.rows[0].cells[4].appendChild(document.createTextNode('职位'));
        oTBody.rows[0].insertCell(5);
        oTBody.rows[0].cells[5].appendChild(document.createTextNode('电话'));
        oTBody.rows[0].insertCell(6);
        oTBody.rows[0].cells[6].appendChild(document.createTextNode('人员类型'));
        oTBody.rows[0].insertCell(7);
        oTBody.rows[0].cells[7].appendChild(document.createTextNode('签到码'));
        // oTBody.rows[0].insertCell(8);
        // oTBody.rows[0].cells[8].appendChild(document.createTextNode('特征值'));
        // oTBody.rows[0].insertCell(8);
        // oTBody.rows[0].cells[8].appendChild(document.createTextNode('照片'));
        // oTBody.rows[0].cells[8].style.display = 'none';
        oTBody.rows[0].insertCell(8);
        oTBody.rows[0].cells[8].appendChild(document.createTextNode('库索引'));
        oTBody.rows[0].cells[8].style.display = 'none';

        
        InTb.appendChild(oTBody);                                     //将创建的tbody添加入table

        //console.log("parseInt(PageNo.value) =",parseInt(PageNo.value),PageNo.value);
        //console.log(document.getElementsByTagName("tr"));
        //循环打印数组值
        for(i=0;i<parseInt(PageNo.value);i++)
        {                             
            if(typeof(totallist.dataStore[i]) == "object")     
            {
                oTBody.insertRow(i+1);
                for(j=0;j<9;j++)
                {
                    oTBody.rows[i+1].insertCell(j);
                    ///////////
                    
                    if(j == 0)
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personIndex));
                    if(j == 1)
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personName));
                    if(j == 2)
                    {
                        if(totallist.dataStore[i].personGender == "male")
                            oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("男"));
                        else
                            oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("女"));
                    }
                        
                    if(j == 3)
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personCompany));
                    if(j == 4)
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personJob));
                    if(j == 5)
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personPhone));
                    if(j == 6)
                    {
                        if(totallist.dataStore[i].personType == "general")
                            oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("普通人员"));
                        else if(totallist.dataStore[i].personType == "special")
                            oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("特殊人员"));
                        else if(totallist.dataStore[i].personType == "vip")
                            oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("VIP人员"));
                    }
                    if(j == 7)
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personSignCode));
                    // if(j == 7)
                    //     oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personEigenValue));
                    /*if(j == 8)
                    {
                        var img = new Image();
                        img.src = totallist.dataStore[i].personPhoto;
                        img.width = 40;
                        img.height = 50;
                        oTBody.rows[i+1].cells[j].appendChild(img);
                        //oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(""));//返回注册的数据，暂时不显示照片                       
                    }*/
                    if(j == 8)
                    {
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i].personId));
                        oTBody.rows[i+1].cells[j].style.display = 'none';
                    }

                }
                //
                
                oTBody.rows[i+1].onclick =  function(){getData(this)}; 
            }   
        }
    }
}
//下一页
function Neponclick()
{
    //console.log("Neponclick =",currentPage,SumPage);
    if(currentPage<SumPage)                                 //判断当前页数小于总页数
    {
        InTb.innerHTML='';
        S1.innerHTML='';

        var totallist;
        if(allorinquire)
            totallist = personlist;
        else
            totallist = newTotalList;

        if(totallist.listSize%PageNo.value==0)
        {
            SumPage=parseInt(totallist.listSize/PageNo.value);
            //console.log("SumPage1 =",totallist.listSize,SumPage);
        }
        else
        {
            SumPage=parseInt(totallist.listSize/PageNo.value)+1
            //console.log("SumPage2 =",totallist.listSize,SumPage);
        }
        S1.appendChild(document.createTextNode(SumPage));
        S2.innerHTML='';
        currentPage=currentPage+1;
        S2.appendChild(document.createTextNode(currentPage));
        var oTBody=document.createElement('tbody');
        oTBody.setAttribute('class','In-table');
        oTBody.insertRow(0);
        oTBody.rows[0].insertCell(0);
        oTBody.rows[0].cells[0].appendChild(document.createTextNode('序号'));
        oTBody.rows[0].insertCell(1);
        oTBody.rows[0].cells[1].appendChild(document.createTextNode('姓名'));
        oTBody.rows[0].insertCell(2);
        oTBody.rows[0].cells[2].appendChild(document.createTextNode('性别'));
        oTBody.rows[0].insertCell(3);
        oTBody.rows[0].cells[3].appendChild(document.createTextNode('公司'));
        oTBody.rows[0].insertCell(4);
        oTBody.rows[0].cells[4].appendChild(document.createTextNode('职位'));
        oTBody.rows[0].insertCell(5);
        oTBody.rows[0].cells[5].appendChild(document.createTextNode('电话'));
        oTBody.rows[0].insertCell(6);
        oTBody.rows[0].cells[6].appendChild(document.createTextNode('人员类型'));
        oTBody.rows[0].insertCell(7);
        oTBody.rows[0].cells[7].appendChild(document.createTextNode('签到码'));
        // oTBody.rows[0].insertCell(8);
        // oTBody.rows[0].cells[8].appendChild(document.createTextNode('特征值'));
        // oTBody.rows[0].insertCell(8);
        // oTBody.rows[0].cells[8].appendChild(document.createTextNode('照片'));
        // oTBody.rows[0].cells[8].style.display = 'none';
        oTBody.rows[0].insertCell(8);
        oTBody.rows[0].cells[8].appendChild(document.createTextNode('库索引'));
        oTBody.rows[0].cells[8].style.display = 'none';
        
        InTb.appendChild(oTBody);
        var a;                                                 //定义变量a
        a=PageNo.value*(currentPage-1);                       //a等于每页显示的行数乘以上一页数
        //console.log("currentPage =",currentPage);
        var c;                                                  //定义变量c
        if(totallist.listSize-a>=PageNo.value)                  //判断下一页数组数据是否小于每页显示行数
        {
            c=PageNo.value;
        }
        else
        {
            c=totallist.listSize-a;
        }
        //console.log("c =",c);
        for(i=0;i<c;i++)
        {
            oTBody.insertRow(i+1);
            for(j=0;j<9;j++)
            {

                oTBody.rows[i+1].insertCell(j);
                if(j == 0)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personIndex));
                if(j == 1)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personName));//数组从第i+a开始取值
                if(j == 2)
                {
                    if(totallist.dataStore[i+a].personGender == "male")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("男"));
                    else
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("女"));
                }
                if(j == 3)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personCompany));
                if(j == 4)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personJob));
                if(j == 5)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personPhone));
                if(j == 6)
                {
                    if(totallist.dataStore[i+a].personType == "general")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("普通人员"));
                    else if(totallist.dataStore[i+a].personType == "special")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("特殊人员"));
                    else if(totallist.dataStore[i+a].personType == "vip")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("VIP人员"));
                }
                if(j == 7)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personSignCode));
                // if(j == 7)
                //     oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personEigenValue));
                /*if(j == 8)
                {
                    var img = new Image();
                    img.src = totallist.dataStore[i+a].personPhoto;
                    img.width = 40;
                    img.height = 50;
                    oTBody.rows[i+1].cells[j].appendChild(img);
                        //oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(""));
                }*/

                if(j == 8)
                {
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personId));
                    oTBody.rows[i+1].cells[j].style.display = 'none';
                }
            }    
            oTBody.rows[i+1].onclick =  function(){getData(this)};                                                         
        }
    }
}
//上一页
function Prponclick()
{
    if(currentPage>1)                        //判断当前是否在第一页
    {
        InTb.innerHTML='';
        S1.innerHTML='';

        var totallist;
        if(allorinquire)
            totallist = personlist;
        else
            totallist = newTotalList;

        if(totallist.listSize%PageNo.value==0)
        {
            SumPage=parseInt(totallist.listSize/PageNo.value);
        }
        else
        {
            SumPage=parseInt(totallist.listSize/PageNo.value)+1
        }
        S1.appendChild(document.createTextNode(SumPage));
        S2.innerHTML='';
        currentPage=currentPage-1;
        S2.appendChild(document.createTextNode(currentPage));
        var oTBody=document.createElement('tbody');
        oTBody.setAttribute('class','In-table');
        oTBody.insertRow(0);
        oTBody.rows[0].insertCell(0);
        oTBody.rows[0].cells[0].appendChild(document.createTextNode('序号'));
        oTBody.rows[0].insertCell(1);
        oTBody.rows[0].cells[1].appendChild(document.createTextNode('姓名'));
        oTBody.rows[0].insertCell(2);
        oTBody.rows[0].cells[2].appendChild(document.createTextNode('性别'));
        oTBody.rows[0].insertCell(3);
        oTBody.rows[0].cells[3].appendChild(document.createTextNode('公司'));
        oTBody.rows[0].insertCell(4);
        oTBody.rows[0].cells[4].appendChild(document.createTextNode('职位'));
        oTBody.rows[0].insertCell(5);
        oTBody.rows[0].cells[5].appendChild(document.createTextNode('电话'));
        oTBody.rows[0].insertCell(6);
        oTBody.rows[0].cells[6].appendChild(document.createTextNode('人员类型'));
        oTBody.rows[0].insertCell(7);
        oTBody.rows[0].cells[7].appendChild(document.createTextNode('签到码'));
        // oTBody.rows[0].insertCell(8);
        // oTBody.rows[0].cells[8].appendChild(document.createTextNode('特征值'));
        // oTBody.rows[0].insertCell(8);
        // oTBody.rows[0].cells[8].appendChild(document.createTextNode('照片'));
        // oTBody.rows[0].cells[8].style.display = 'none';
        oTBody.rows[0].insertCell(8);
        oTBody.rows[0].cells[8].appendChild(document.createTextNode('库索引'));
        oTBody.rows[0].cells[8].style.display = 'none';
        InTb.appendChild(oTBody);
        var a;
        a=PageNo.value*(currentPage-1);
        for(i=0;i<parseInt(PageNo.value);i++)
        {
            oTBody.insertRow(i+1);
            for(j=0;j<9;j++)
            {
                oTBody.rows[i+1].insertCell(j);
                if(j == 0)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personIndex));
                if(j == 1)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personName));
                if(j == 2)
                {
                    if(totallist.dataStore[i+a].personGender == "male")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("男"));
                    else
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("女"));
                }
                if(j == 3)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personCompany));
                if(j == 4)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personJob));
                if(j == 5)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personPhone));
                if(j == 6)
                {
                    if(totallist.dataStore[i+a].personType == "general")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("普通人员"));
                    else if(totallist.dataStore[i+a].personType == "special")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("特殊人员"));
                    else if(totallist.dataStore[i+a].personType == "vip")
                        oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("VIP人员"));
                }
                if(j == 7)
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personSignCode));
                // if(j == 7)
                //     oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personEigenValue));
                /*if(j == 8)
                {
                    var img = new Image();
                    img.src = totallist.dataStore[i+a].personPhoto;
                    img.width = 40;
                    img.height = 50;
                    oTBody.rows[i+1].cells[j].appendChild(img);
                    //oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(""));
                }*/
                    
                if(j == 8)
                {
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personId));
                    oTBody.rows[i+1].cells[j].style.display = 'none';
                }
            }
            oTBody.rows[i+1].onclick =  function(){getData(this)}; 
        }
    }
}
//尾页
function Lponclick()
{
    InTb.innerHTML='';
    S1.innerHTML='';

    var totallist;
    if(allorinquire)
        totallist = personlist;
    else
        totallist = newTotalList;

    if(totallist.listSize%PageNo.value==0)
    {
        SumPage=parseInt(totallist.listSize/PageNo.value);
    }
    else
    {
        SumPage=parseInt(totallist.listSize/PageNo.value)+1
    }
    S1.appendChild(document.createTextNode(SumPage));
    S2.innerHTML='';
    currentPage=SumPage;
    S2.appendChild(document.createTextNode(currentPage));
    var oTBody=document.createElement('tbody');
    oTBody.setAttribute('class','In-table');
    oTBody.insertRow(0);
    oTBody.rows[0].insertCell(0);
    oTBody.rows[0].cells[0].appendChild(document.createTextNode('序号'));
    oTBody.rows[0].insertCell(1);
    oTBody.rows[0].cells[1].appendChild(document.createTextNode('姓名'));
    oTBody.rows[0].insertCell(2);
    oTBody.rows[0].cells[2].appendChild(document.createTextNode('性别'));
    oTBody.rows[0].insertCell(3);
    oTBody.rows[0].cells[3].appendChild(document.createTextNode('公司'));
    oTBody.rows[0].insertCell(4);
    oTBody.rows[0].cells[4].appendChild(document.createTextNode('职位'));
    oTBody.rows[0].insertCell(5);
    oTBody.rows[0].cells[5].appendChild(document.createTextNode('电话'));
    oTBody.rows[0].insertCell(6);
    oTBody.rows[0].cells[6].appendChild(document.createTextNode('人员类型'));
    oTBody.rows[0].insertCell(7);
    oTBody.rows[0].cells[7].appendChild(document.createTextNode('签到码'));
    // oTBody.rows[0].insertCell(8);
    // oTBody.rows[0].cells[8].appendChild(document.createTextNode('特征值'));
    // oTBody.rows[0].insertCell(8);
    // oTBody.rows[0].cells[8].appendChild(document.createTextNode('照片'));
    // oTBody.rows[0].cells[8].style.display = 'none';
    oTBody.rows[0].insertCell(8);
    oTBody.rows[0].cells[8].appendChild(document.createTextNode('库索引'));
    oTBody.rows[0].cells[8].style.display = 'none';
    InTb.appendChild(oTBody);
    var a;
    a=PageNo.value*(currentPage-1);
    var c;
    if(totallist.listSize-a>=PageNo.value)
    {
        c=PageNo.value;
    }
    else
    {
        c=totallist.listSize-a;
    }
    for(i=0;i<c;i++)
    {
        oTBody.insertRow(i+1);
        for(j=0;j<9;j++)
        {
            oTBody.rows[i+1].insertCell(j);
            if(j == 0)
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personIndex));
            if(j == 1)
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personName));
            if(j == 2)
            {
                if(totallist.dataStore[i+a].personGender == "male")
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("男"));
                else
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("女"));
            }
            if(j == 3)
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personCompany));
            if(j == 4)
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personJob));
            if(j == 5)
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personPhone));
            if(j == 6)
            {
                if(totallist.dataStore[i+a].personType == "general")
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("普通人员"));
                else if(totallist.dataStore[i+a].personType == "special")
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("特殊人员"));
                else if(totallist.dataStore[i+a].personType == "vip")
                    oTBody.rows[i+1].cells[j].appendChild(document.createTextNode("VIP人员"));
            }
            if(j == 7)
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personSignCode));
            // if(j == 7)
            //     oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personEigenValue));
            /*if(j == 8)
            {
                var img = new Image();
                img.src = totallist.dataStore[i+a].personPhoto;
                img.width = 40;
                img.height = 50;
                oTBody.rows[i+1].cells[j].appendChild(img);
                //oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(""));
            }*/
                
            if(j == 8)
            {
                oTBody.rows[i+1].cells[j].appendChild(document.createTextNode(totallist.dataStore[i+a].personId));
                oTBody.rows[i+1].cells[j].style.display = 'none';
            }
        }
        oTBody.rows[i+1].onclick =  function(){getData(this)}; 
    }
}

