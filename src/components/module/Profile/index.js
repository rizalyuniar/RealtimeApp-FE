import React, { useEffect, useState } from 'react'
import style from './style.module.css'
import calvin from './photo.png'
import Button from '../../base/Button'
import { useNavigate } from 'react-router'

const Profile = ({ data, setEditModal, socket }) => {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('token')
    socket.emit('close')
    navigate('/login')
  }
  return (
    <div className={style.profile}>
      <img src={data?.photo || calvin} alt="" style={{
        borderRadius: "20px"
      }} />
      {/* <img src={logout} alt="" className={style.logout} onClick={handleLogout}/> */}
      <h5 className='my-0 mt-2'>{data.fullname}</h5>
      <p className='mx-0 my-0 py-2'>@rizalyuniar</p>
      <div className="d-flex">
        <Button title="Edit" style={{ width: '90px', margin: "5px" }} onClick={() => setEditModal((current) => !current)} />
        <Button title="Logout" style={{ width: '90px', margin: "5px", backgroundColor: "white", color: "red"}} onClick={handleLogout} />
      </div>

    </div>
  )
}

export default Profile