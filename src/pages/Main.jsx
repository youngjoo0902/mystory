import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

function Main() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) return;

      const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', data.user.id).single()

      if (error || !data.user) {
        return
      }

      setUser(profile)
    }

    getUser()
  }, [])

  // 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

    return(
        <div className="main">
            <div>메인 페이지 {user && <p className="username">{user.username}님, 안녕하세요.</p>}</div>
            <p>방어로직 하나도 안되어있음. 해킹시도금지~ 해봤자 데이터 없음</p>
            {user
            ? <button onClick={handleLogout}>로그아웃</button>
            : <Link to="/login">로그인하세요</Link>
            }
        </div>
    )
}

export default Main;