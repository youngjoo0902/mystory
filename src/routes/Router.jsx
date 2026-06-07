import { Routes, Route } from 'react-router-dom'
import DefaultLayout from '../layouts/DefaultLayout'
import EmptyLayout from '../layouts/EmptyLayout'
import Main from '../pages/Main'
import About from '../pages/About'
import Login from '../pages/Login'
import Join from '../pages/Join'
import Story from '../pages/Story'
import Visitor from '../pages/Visitor'
//import FindId from '../pages/FindId'

function Router() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/story" element={<Story />} />
        <Route path="/visitor" element={<Visitor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
      </Route>
      <Route element={<EmptyLayout />}>
      </Route>
      {/* <Route path="/find-id" element={<FindId />} /> */}
    </Routes>
  )
}

export default Router