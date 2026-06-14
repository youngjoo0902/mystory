import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
//import { HashRouter } from 'react-router-dom'

import './assets/css/reset.css'
import './assets/css/layout.css'
import './assets/css/login.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createRoot(document.getElementById('root')).render(
  // 해시라우터는 basename 삭제
  // <HashRouter basename={import.meta.env.PROD ? '/mystory' : '/'}>
  //<HashRouter>
    <App />
  //</HashRouter>,
)
