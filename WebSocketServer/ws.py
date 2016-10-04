# -*- coding: utf-8 -*-
from bottle import *
from bottle.ext.websocket import GeventWebSocketServer
from bottle.ext.websocket import websocket
import json
import re

ws_set = set()

userlist = {"type": "userlist", "userlist": {}}


@get('/ws', apply=[websocket])
def chat(ws):
    ws_set.add(ws)
    senduser = ws.environ.get('HTTP_SEC_WEBSOCKET_KEY')
    while True:
        msg = ws.receive()
        if msg is None:
            break
        # 获取信息发送者Key
        json_msg = json.loads(msg)

        if json_msg["type"] == "join":
            # 用户加入聊天
            userlist["userlist"][senduser] = json_msg["name"]
            # 广播用户列表
            for each in ws_set:
                each.send(json.dumps(userlist))
        elif json_msg["type"] == "chat":
            # 过滤meta标签和script标签
            msg = re.sub(r'(?i)<(/?meta.*?)>', "<!---->", msg)
            msg = re.sub(r'(?i)<(/?script.*?)>', "<!---->", msg)
            # 广播聊天信息
            for each in ws_set:
                recvuser = each.environ.get('HTTP_SEC_WEBSOCKET_KEY')
                if recvuser != senduser:
                    each.send(msg)
    # 移除用户
    ws_set.remove(ws)
    del(userlist["userlist"][senduser])
    # 广播用户列表
    for each in ws_set:
        each.send(json.dumps(userlist))


if __name__ == '__main__':
    run(host='0.0.0.0', port=8000, server=GeventWebSocketServer)
