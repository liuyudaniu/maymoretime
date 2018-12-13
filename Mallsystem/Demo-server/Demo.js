let user = require("./User");
console.log(`userName:${user.userName}`);
console.log(`I'm ${user.sayHello()}`);

let http = require("http");
let url = require("url");
let util = require("util");
let server = http.createServer((req,res)=>{
  res.statusCode = 200;
  res.setHeader("Content-type","text/html;charset=utf-8");

  res.end(util.inspect(url.parse(req.url)));
});
server.listen(3000,'127.0.0.1',()=>{
  console.log('服务器已经运行，请打开浏览器继续访问')
})
