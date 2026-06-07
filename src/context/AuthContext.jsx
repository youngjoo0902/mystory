import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const fetchProfile = async (authUser) => {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', authUser.id).single()
        //console.log(authUser);

        return {
            ...authUser,
            username: profile?.username
        }
    }

    useEffect(() => {

        // 1. 초기 로그인 상태
        const init = async () => {
            const { data } = await supabase.auth.getUser()

            if (!data.user) return

            const fullUser = await fetchProfile(data.user)
            setUser(fullUser)
        }

        init()

        // 2. 로그인/로그아웃 실시간 감지
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {

                if (!session?.user) {
                    setUser(null)
                    return
                }

                const fullUser = await fetchProfile(session.user)
                setUser(fullUser)
            }
        )

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)