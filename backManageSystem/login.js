function btnLoginOnclick(){
    var nameid = document.getElementById("username");
    var pwdid = document.getElementById("password");
    var btnid = document.getElementById("btn-login");
    if( nameid.value == "" || pwdid.value == "")
    {
        document.getElementById("error").innerHTML="请输入用户名和密码";
    }
    else if( nameid.value == "admin" && pwdid.value == "tamigroup")
    {
        window.location.href="signinformation.html";
    }
    else
    {
        document.getElementById("error").innerHTML="请输入正确的用户名和密码";
    }
}