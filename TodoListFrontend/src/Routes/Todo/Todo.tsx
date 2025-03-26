import s from "./Todo.module.scss"
import { Input } from "../../components/Input/Input"
import { Tasks } from "../../components/Tasks/Tasks"
import { Header } from "../../components/Header/Header"

export function Todo() {
    return (
        <section className={s.todo}>
            <Header />
            <div className={s.container}>
                <Input />
                <Tasks />
            </div>
        </section>
    )
};

