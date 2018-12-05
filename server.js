const express = require("express");
const fs = require("fs");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;
const logFileName = "log.txt";
server.listen(port);

// save last index fo file
var saveFileLastLine = 0;


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// get data from file as array
function getFileData() {
  var data = fs.readFileSync(logFileName, "utf-8");
  return data.split("\n");
}


// file watcher run every time when anything is chnage on file
fs.watchFile(logFileName, (event, fileName) => {
  let fileData = getFileData();
  let totalFileLines  =fileData.length;

  // code only run when add new lines
  if(saveFileLastLine <= totalFileLines){
    let lastTenLines = fileData.filter((data, index) => saveFileLastLine < index);
    saveFileLastLine =totalFileLines-1 ;
    io.emit("send", { message: lastTenLines });
  }
});

io.on("connection", function(socket) {
  socket.on("initialized", function(data) {
    let fileData = getFileData();

    // save only last ten row
    let lastTenLines = [];
    saveFileLastLine = fileData.length - 1;
  
    for (let i = saveFileLastLine; i >(saveFileLastLine-10); i--) {
      lastTenLines.push(fileData[i]);
    }
    
     io.to(data.id).emit("send", { message: lastTenLines.reverse() });
  });
});
