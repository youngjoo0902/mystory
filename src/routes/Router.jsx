import { Routes, Route } from 'react-router-dom'

import Main from '../pages/Main'
import Login from '../pages/Login'
import Join from '../pages/Join'
//import FindId from '../pages/FindId'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/join" element={<Join />} />
      {/* <Route path="/find-id" element={<FindId />} /> */}
    </Routes>
  )
}

export default Router