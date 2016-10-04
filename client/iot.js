var socketurl="ws://your.WebSocket.";
var nickname="Anymouns";

var socket;

function show_msg (nick,msg) {
	var chatbox=document.querySelector("#chat-msgbox");
	var msgdiv=document.createElement("div");
	msgdiv.classList="iot-chat-content-text";
	msgdiv.innerHTML=msg.split("\n").join("<br />");;
	var nickspan=document.createElement("span");
	nickspan.innerHTML=nick;
	var msgcon=document.createElement("div");
	msgcon.classList="mdl-list__item-primary-content";
	msgcon.appendChild(nickspan);
	msgcon.appendChild(msgdiv);

	var chatele=document.createElement("li");
	chatele.classList="iot-chat-content";
	chatele.appendChild(msgcon);
	chatbox.appendChild(chatele);
	chatbox.scrollTop = chatbox.scrollHeight;
}
/*Init JS*/
function chat_init () {
	//申请通知权限
	Notification.requestPermission( function(status) {
		console.log(status); // 仅当值为 "granted" 时显示通知
	});
	//是否为第一次使用
	if(window.localStorage["first"]=="no"){
		nickname=window.localStorage["nickname"];
		//创建WebSocket
		socket = new WebSocket(socketurl);
		socket.onopen = function(event) { 
			//加入聊天
			var data={
				type:"join",
				name:nickname
			}
			socket.send(JSON.stringify(data)); 
			// 监听消息
			socket.onmessage = function(event) { 
				var msg = JSON.parse(event.data);
				if (msg.type=="chat") {
					show_msg(msg.name,msg.msg);
					if (window.Notification && Notification.permission === "granted") {
						var notification = new Notification("来自 "+msg.name+" 的消息",{
							body : msg.msg,
							icon : '',
							tag : {}
						});
					}
				}else if (msg.type=="userlist") {
					//刷新用户列表
					document.querySelector("#userlist").innerHTML="";
					for(var name in msg["userlist"]){
						var p = document.createElement("p");
						p.classList="iot-chat-userlist";
						var i = document.createElement("i");
						i.classList="mdl-color-text--blue-grey-400 material-icons iot-chat-useritem";
						i.setAttribute("role","presentation");
						i.innerHTML="&#xE7FD;";
						p.appendChild(i);
						p.innerHTML=p.innerHTML+msg["userlist"][name];
						componentHandler.upgradeElement(p);
						document.querySelector("#userlist").appendChild(p);
						//console.log(msg["userlist"][name]);
					}
				}
			}
			// 监听Socket的关闭
			socket.onclose = function(event) { 
				var snackbarContainer = document.getElementById('msgbox');
				var data = {
					message: "LuChat连接中断,正在重新连接"
				}
				snackbarContainer.MaterialSnackbar.showSnackbar(data);
				//var n = new Notification("Oops! 与LuChat服务器连接中断", {body: "正在尝试重新连接..."});
				window.setTimeout("chat_init()",3000);
			}
			// 关闭Socket.... 
			//socket.close();
		}
		//发送信息
		document.querySelector("#chat-send").addEventListener('click', function() {
			if (document.querySelector(".iot-chat-textarea").value!="") {
				var data={
					type:"chat",
					name:nickname,
					msg:document.querySelector(".iot-chat-textarea").value
				}
				socket.send(JSON.stringify(data));
				//show_msg(nickname,document.querySelector(".iot-chat-textarea").value);
				document.querySelector(".iot-chat-textarea").value="";
				show_msg(data.name,data.msg);
			}
		});
		//实现Enter 发送 Ctrl+Enter 换行
		document.querySelector(".iot-chat-textarea").addEventListener("keypress",function (e) {
			var keypress;
			if(window.event){
				//IE
				keypress = e.keyCode
			}else if(e.which){
				// Netscape/Firefox/Opera
				keypress = e.which
			}
			if (keypress==13) {
				//按下回车键发送
				if (document.querySelector(".iot-chat-textarea").value!="") {
					var data={
						type:"chat",
						name:nickname,
						msg:document.querySelector(".iot-chat-textarea").value
					}
					socket.send(JSON.stringify(data));
					//show_msg(nickname,document.querySelector(".iot-chat-textarea").value);
					document.querySelector(".iot-chat-textarea").value="";
					show_msg(data.name,data.msg);
					e.returnValue = false;
					return false;
				}
			}else if (keypress==10) {
				//Ctrl+Enter换行
				document.querySelector(".iot-chat-textarea").value=document.querySelector(".iot-chat-textarea").value+'\n';
			};
		});
	}else{
		//First Setup
		//init Dialog Element
		var first_setting_dialog = document.querySelector("#first-setting-dialog");
		if (! first_setting_dialog.showModal) {
			dialogPolyfill.registerDialog(first_setting_dialog);
		}
		first_setting_dialog.querySelector('.savedata').addEventListener('click', function() {
			nickname = first_setting_dialog.querySelector('.nickname').value;
			window.localStorage["nickname"] = nickname;
			var snackbarContainer = document.getElementById('msgbox');
      		var data = {
				message: "设置成功"
			};
			snackbarContainer.MaterialSnackbar.showSnackbar(data);
			window.localStorage["first"]="no";
			first_setting_dialog.close();
			window.location.reload();
		});
		first_setting_dialog.showModal();
	}
}
window.onload=function(){
	chat_init();
}
