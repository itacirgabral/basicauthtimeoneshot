const express = require('express')
const cookieParser = require('cookie-parser')
const auth = require('basic-auth')
const e = require('express')

const app = express()
app.use(cookieParser())

const sessoes = []

app.get('/', (req, res, next) => {
  // recupera a sessao pelo id nos cookies
  const sessaoId = req.cookies.sessao || 'none'
  const sessao = sessoes.find(el => el.id === sessaoId)

  if (sessao) {
    const agora = new Date()
    if (sessao.expires.getTime() > agora.getTime()) {
      // se a sessão existe e não está expirada, segue a rota
      next()
    } else {
      // remove a sessao expirada
      const sessaoAntigaIdx = sessoes.indexOf(sessao)
      sessoes.splice(sessaoAntigaIdx, 1)
      res.setHeader('content-type', 'text/html')
      res.status(201)
      res.send('<h1>Sessão expirada</h1><a href="/login">login</a>')
      next('sessão expirada')
    }
  } else {
    res.setHeader('content-type', 'text/html')
    res.status(201)
    res.send('<h1>Não autorizado</h1><a href="/login">login</a>')
    next('não autorizado')
  }
})
app.get('/', (req, res) => {
  res.setHeader('content-type', 'text/html')
  res.status(200)
  res.send(`<h1>sessaoID ${req.cookies.sessao}</h1>`)
})

app.get('/login', (req, res, next) => {
  const userReq = auth(req)
  if(userReq && userReq.name === 'admin' & userReq.pass === 'admin') {
    // gera uma nova sessao
    const sessaoID = Math.random().toString().slice(2)
    const umMinuto = 60000
    const expires = new Date(Date.now() + umMinuto * 10)

    // remove a sessao antiga, se ouver
    const sessaoAntigaIdx = sessoes.findIndex(el => el.name === userReq.name)
    if (sessaoAntigaIdx !== -1) {
      sessoes.splice(sessaoAntigaIdx, 1)
    }

    // salva a nova sessao
    sessoes.push({ name: userReq.name, id: sessaoID, expires})

    // salva a identificação da sessao nos cookies
    res.cookie('sessao', sessaoID, { expires, httpOnly: true })
    next()
  } else {
    res.status(401)
    res.setHeader('WWW-Authenticate', 'Basic')
    next("auth error")
  }
})
app.get('/login', (req, res) => {
  res.status(200)
  res.setHeader('content-type', 'text/html')
  res.send('<a href="/">home</a>')
})

app.listen(3000, function () {
  console.log("O servidor está no ar")
})