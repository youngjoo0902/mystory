import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

function NavBar() {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    // 로그아웃
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }
    const toggle = () => {
        setMenuOpen(prev => !prev);
    }
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={menuOpen ? "nav on" : "nav"} ref={menuRef}>
            <button className="menu" onClick={toggle}><span></span></button>
            <div className="menu_list">
                <div className="user_info">
                {user ? (
                    <>
                        <p className="username">{user.username}님</p>
                        <Link to="/" className="logout" onClick={handleLogout}>로그아웃</Link>
                    </>
                ) : (
                    <Link to="/login" className="login" onClick={toggle}>로그인하세요</Link>
                )}
                </div>
                <ul>
                    <li><NavLink to="/about" onClick={toggle}>About</NavLink></li>
                    {user && 
                        <>
                        <li><NavLink to="/story" onClick={toggle}>Story</NavLink></li>
                        <li><NavLink to="/memo" onClick={toggle}>Memo</NavLink></li>
                        </>
                    }
                    <li><NavLink to="/community" onClick={toggle}>Community</NavLink></li>
                    <li><NavLink to="/guest" onClick={toggle}>Guest</NavLink></li>
                </ul>
            </div>
        </div>
  );
}

export default NavBar;