import s from "./SignIn.module.scss"
import { useState } from "react"
import { Header } from "../../components/Header/Header"
import { useFetchSignInMutation, useFetchAllTasksQuery } from "../../store/apiSlice"
import { useNavigate, Link } from "react-router-dom"

export function SignIn() {
  const nav = useNavigate()
  const [userData, setUserData] = useState({ email: '', password: '' })
  const [fetchSignIn] = useFetchSignInMutation()
  const { refetch } = useFetchAllTasksQuery()
  const [error, setError] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const clearData = { email: userData.email.trim(), password: userData.password.trim() }
      await fetchSignIn(clearData).unwrap()
      await refetch()
      nav('/')
      window.location.reload()
    } catch (err: unknown) {
      console.error("Ошибка при входе:", err);
      const errorMessage = err && typeof err === 'object' && 'data' in err && 
        err.data && typeof err.data === 'object' && 'error' in err.data
        ? String(err.data.error)
        : 'Ошибка входа. Проверьте данные и попробуйте снова.'
      setError(errorMessage)
    }
  }

  return (
    <>
      <Header />
      <div className={s.signInPage}>
        <div className={s.formContainer}>
          <h1>Вход в аккаунт</h1>
          <form onSubmit={handleSignIn}>
            <input 
              type="email" 
              placeholder="Email" 
              value={userData.email} 
              onChange={(e) => setUserData({ ...userData, email: e.target.value })} 
              required
            />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={userData.password} 
              onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
              required
            />
            {error && <p className={s.errorMessage}>{error}</p>}
            <button type="submit">Войти</button>
          </form>
          <div className={s.registerLink}>
            Нет аккаунта? <Link to="/sign-up">Зарегистрируйтесь</Link>
          </div>
        </div>
      </div>
    </>
  )
};