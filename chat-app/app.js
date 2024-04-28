require('dotenv').config();
const mongoose =require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/new-chat-app');
const app = require('express')();
const http =  require('http').Server(app);
const userRoute =require('./routes/userRoutes');

app.use('/',userRoute)
const User =require('./models/userModels');
const io =require('socket.io')(http);
var usp =io.of('/user-namespace')
usp.on( 'connection' ,async function(socket) {
    console.log( "User connected" );

    var userId =socket.handshake.auth.token
    await User.findByIdAndUpdate({_id:userId},{$set:{isOnline :'1'}})
    socket.broadcast.emit('getOnlineUser',{user_id: userId})

    socket.on('disconnect',async function(){
        console.log("User disconnected");
        var userId =socket.handshake.auth.token
        await User.findByIdAndUpdate({_id:userId},{$set:{isOnline :'0'}})
        socket.broadcast.emit('getOfflineUser',{user_id: userId})
    })
    // chat implemt
    socket.on('newChat',function(data){
socket.broadcast.emit('loadNewChat',data);
    })
});

http.listen(3000,function(){console.log("server is running")});