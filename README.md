# LuChat
A anonymous chat room


### Install WebSocket moudle
Use `pip` or `easy_install`:

    pip install bottle
    pip install bottle-websocket

### Run WebSocket Server

    python ws.py
    
Or running in the background

    nohup python ws.py &
    
### Edit iot.js
You need edit the first line of `iot.js`
    var socketurl="ws://your.WebSocket.address";
