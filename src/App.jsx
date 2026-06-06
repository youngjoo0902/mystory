import { useState } from 'react'
import Login from './pages/Login'
import Router from './routes/Router'
import { Link } from 'react-router-dom'

function App() {
  /*
    ★구현할거★
    - 깃 연결, 깃 페이지 연결 => 완료
    - 라우터 적용 => 완료
    - 회원가입
    - 로그인 페이지
  */

  return (
    <section id="wrapper">
      <header id="header">
        <h1><Link to="/"></Link></h1>
      </header>
      <Router />
      <footer id="footer">
        <p>Copyright 2026. All rights reserved.</p>
      </footer>
    </section>
  )
}

export default App
