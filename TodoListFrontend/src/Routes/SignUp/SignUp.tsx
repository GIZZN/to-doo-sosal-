import s from "./SignUp.module.scss"
import React, { useState } from "react"
import { Header } from "../../components/Header/Header"
import { useFetchSignUpMutation } from "../../store/apiSlice"
import { useNavigate, Link } from "react-router-dom"

export function SignUp() {
  const [fetchSignUp] = useFetchSignUpMutation()
  const [user, setUser] = useState({ username: '', email: '', password: '' })
  const [passwordR, setPasswordR] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function handleSendUserData(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (passwordR === user.password) {
        const clearData = { username: user.username.trim(), email: user.email.trim(), password: user.password.trim() }
        await fetchSignUp(clearData).unwrap()
        nav('/sign-in')
      } else {
        setError('Пароли не совпадают');
      }
    } catch (err: unknown) {
      console.error("Ошибка при регистрации:", err);
      const errorMessage = err && typeof err === 'object' && 'data' in err && 
        err.data && typeof err.data === 'object' && 'error' in err.data
        ? String(err.data.error)
        : 'Ошибка регистрации. Попробуйте другой email.'
      setError(errorMessage)
    }
  }

  return (
    <>
      <Header />
      <div className={s.signUpPage}>
        <div className={s.formContainer}>
          <h1>Регистрация</h1>
          <form onSubmit={handleSendUserData}>
            <input 
              type="text" 
              placeholder="Имя пользователя" 
              value={user.username} 
              onChange={(e) => setUser({ ...user, username: e.target.value })} 
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={user.email} 
              onChange={(e) => setUser({ ...user, email: e.target.value })} 
              required
            />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={user.password} 
              onChange={(e) => setUser({ ...user, password: e.target.value })} 
              required
            />
            <input 
              type="password" 
              placeholder="Повторите пароль" 
              value={passwordR} 
              onChange={(e) => setPasswordR(e.target.value)} 
              required
            />
            {error && <p className={s.errorMessage}>{error}</p>}
            <button type="submit">Зарегистрироваться</button>
          </form>
          <div className={s.loginLink}>
            Уже есть аккаунт? <Link to="/sign-in">Войдите</Link>
          </div>
        </div>
      </div>
    </>
  )
};

