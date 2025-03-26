import s from "./Header.module.scss"
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useFetchLogoutMutation } from "../../store/apiSlice";

export function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [fetchLogout] = useFetchLogoutMutation();
    const navigate = useNavigate();

    useEffect(() => {

        fetch('http://localhost:5000/api/check-auth', {
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
            setIsAuthenticated(res.ok);
        })
        .catch(() => {
            setIsAuthenticated(false);
        });
    }, []);
    
    const handleLogout = async () => {
        try {
            await fetchLogout().unwrap();
            setIsAuthenticated(false);
            navigate('/sign-in');
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    }

    return (
        <header className={s.header}>
            <div className={s.container}>
                <Link to={'/'} className={s.logo}>TODO LIST</Link>
                <nav className={s.nav}>
                    {isAuthenticated ?
                        <button onClick={handleLogout}>Выйти</button>
                        :
                        <>
                            <NavLink to={'/sign-up'}>Регистрация</NavLink>
                            <NavLink to={'/sign-in'}>Вход</NavLink>
                        </>
                    }
                </nav>
            </div>
        </header>
    )
}

