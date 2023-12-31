import React from 'react'
import style from './style.module.css'
import menu from './menu.svg'

const Title = ({callback}) => {
  // const navigate = useNavigate()
  return (
    <div className={style.title}>
      <h3>Telegram</h3>
      <img src={menu} alt="menu" onClick={() => callback()} />
    </div>
  )
}

export default Title