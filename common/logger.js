let log4js = require('log4js')

log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'log/access.log',
      maxLogSize: 1024,
      backups:3,
      category: 'normal'
    }
  ]
})