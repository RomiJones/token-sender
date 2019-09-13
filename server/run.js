let servers = [
  require('./instance/localServer'),
]

servers.forEach(s=>{
  s.Start()
})