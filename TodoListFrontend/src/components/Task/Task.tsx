import { useDeleteTaskMutation, useFetchEditTaskMutation } from "../../store/apiSlice";
import s from "./Task.module.scss";
import { useState } from "react";

interface TaskProps {
  id: string;
  text: string;
  ischecked: boolean;
}

export function Task({ id, text, ischecked }: TaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [deleteTask] = useDeleteTaskMutation();
  const [fetchEditTask] = useFetchEditTaskMutation();

  const handleCheckBox = async (taskId: string) => {
    try {
      await fetchEditTask({ id: taskId, currentData: !ischecked });
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ id: taskId });
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  const handleEditTask = async () => {
    if (editText.trim() !== text) {
      try {
        await fetchEditTask({ id: id, currentData: editText.trim() });
      } catch (error) {
        console.error("Ошибка при изменении задачи:", error);
      }
    }
    setIsEditing(false);
  };

  return (
    <li className={s.task}>
      <input
        type="checkbox"
        checked={ischecked}
        onChange={() => handleCheckBox(id)}
      />
      
      {isEditing ? (
        <div className={s.editForm}>
          <input
            className={s.editInput}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
          <div className={s.editActions}>
            <button 
              className={s.saveBtn} 
              onClick={handleEditTask}
            >
              Сохранить
            </button>
            <button 
              className={s.cancelBtn} 
              onClick={() => {
                setIsEditing(false);
                setEditText(text);
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className={`${s.text} ${ischecked ? s.completed : ''}`}>{text}</span>
          <div className={s.actions}>
            <button className={s.delete} onClick={() => handleDeleteTask(id)}>Удалить</button>
            <button className={s.edit} onClick={() => setIsEditing(true)}>Изменить</button>
          </div>
        </>
      )}
    </li>
  );
}