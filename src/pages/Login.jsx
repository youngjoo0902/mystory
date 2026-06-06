import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Login(){
  //로그인 상태면 메인페이지로
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {// 로그인 상태면 메인으로
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        navigate('/')
        return
      }

      setLoading(false)
    }

    checkUser()
  }, [])
  if (loading) return null

  const handleLogin = async (e) => {
  e.preventDefault()

  const cleanUsername = username.trim()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', cleanUsername)
    .single()

  console.log(profile, profileError)

  if (profileError || !profile) {
    setError('존재하지 않는 아이디입니다')
    return
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password
  })

  if (loginError) {
    setError('비밀번호 오류')
    return
  }

  navigate('/')
}

  return(
    <div className="login_wrap">
      <div className="login_box">
        <h1>로그인</h1>

        <form onSubmit={handleLogin}>
          <div className="input_group">
            <label>아이디</label>
            <input type="text" placeholder="아이디를 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="input_group">
            <label>비밀번호</label>
            <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="signup_btn">로그인</button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="bottom_menu">
          <button type="button" onClick={() => navigate('/join')}>회원가입</button>
          <span>|</span>
          <button type="button" onClick={() => alert('준비중')}>아이디 찾기</button>
          <span>|</span>
          <button type="button" onClick={() => alert('준비중')}>비밀번호 찾기</button>
        </div>
      </div>
    </div>
    )
}

export default Login;