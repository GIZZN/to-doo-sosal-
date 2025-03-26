import s from "./Tasks.module.scss"
import { useFetchAllTasksQuery } from "../../store/apiSlice";
import { ITask } from "../../types";
import { Task } from "../Task/Task";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useEffect } from 'react';
import { getCookie } from "../../utils/cookies";

export function Tasks() {
  const { data, isLoading, error, isError, refetch } = useFetchAllTasksQuery()

  useEffect(() => {
    const token = getCookie('authToken');
    if (token) {
      refetch();
    }
  }, [refetch]);

  if (isLoading) return <p>Loading</p>

  if (isError) {
    const fetchError = error as FetchBaseQueryError;
    if ('status' in fetchError && fetchError.status === 401) {
      return <p>Зарегистрируйтесь</p>;
    }
    console.error('Ошибка:', error);
    return <p>Произошла ошибка при загрузке задач</p>;
  }

  if (!data || data.length === 0) {
    return <p>Список задач пуст</p>;
  }
  
  return (
    <ul className={s.tasksList}>
      {data.map((el: ITask) => (
        el.id ? (
          <Task
            key={el.id}
            id={el.id}
            text={el.text}
            ischecked={el.ischecked}
          />
        ) : null
      ))}
    </ul>
  );
}

