// import s from "./App.module.scss"
import { Todo } from "./Routes/Todo/Todo"
import { SignIn } from "./Routes/SignIn/SignIn"
import { SignUp } from "./Routes/SignUp/SignUp"
import { RouterProvider, createBrowserRouter } from "react-router-dom"

export function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Todo />
    },
    {
      path: '/sign-up',
      element: <SignUp />
    },
    {
      path: '/sign-in',
      element: <SignIn />
    }
  ])
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
};

