import { useState } from "react";
import { useFetchCreateTaskMutation } from "../../store/apiSlice";
import s from "./Input.module.scss";

export function Input() {
    const [fetchCreateTask] = useFetchCreateTaskMutation();
    const [text, setText] = useState("");

    async function CreateTask(e: React.FormEvent) {
        e.preventDefault();
        try {
            const clearText = text.trim()
            await fetchCreateTask({ text: clearText, isChecked: false, }).unwrap();
            setText("");
        } catch (err) {
            console.error("Ошибка при создании задачи:", err);
        }
    }

    return (
        <form className={s.form} onSubmit={CreateTask}>
            <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                type="text" 
                placeholder="Добавить новую задачу..."
            />
            <button type="submit">Добавить</button>
        </form>
    );
}
