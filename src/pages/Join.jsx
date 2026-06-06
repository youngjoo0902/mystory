import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

function Join(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. 비밀번호 체크
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setError('')
    //원래는 아이디 검증, 이메일 검증, 비밀번호 검증 등등 해야하지만 지금은 생략
    console.log('회원가입 정보:', { username, email, password });

    // 2. Supabase에 회원가입 요청
    const { data, error: signUpError } = await supabase.auth.signUp({email, password})

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // 3. profiles 테이블 저장
    const user = data.user
    const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username,
          email
        }
      ])

    if (profileError) {
      setError(profileError.message)
      return
    }

    // 4. 페이지 이동
    navigate('/')
  }

    return(
    <div className="login_wrap">
      <div className="login_box">
        <h1>회원가입</h1>

        <form onSubmit={handleSubmit}>
          <div className="input_group">
            <label>아이디</label>
            <input type="text" placeholder="아이디를 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="input_group">
            <label>이메일</label>
            <input type="email" placeholder="이메일을 입력하세요" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input_group">
            <label>비밀번호</label>
            <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="input_group">
            <label>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button type="submit" className="signup_btn" disabled={password !== confirmPassword}>회원가입</button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="bottom_menu">
          <button type="button" onClick={() => alert('준비중')}>아이디 찾기</button>
          <span>|</span>
          <button type="button" onClick={() => alert('준비중')}>비밀번호 찾기</button>
        </div>
      </div>
    </div>
    )
}

export default Join;