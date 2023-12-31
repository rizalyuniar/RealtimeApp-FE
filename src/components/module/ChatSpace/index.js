import React, { useEffect, useState } from 'react'
import style from './style.module.css'
import profilemenu from './profilemenu.svg'
import calvin from './photo.png'
import axios from 'axios'
import { useRef } from 'react'
import { userAction } from '../../../configs/redux/actions/userAction'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuid } from 'uuid';
import Swal from 'sweetalert2';

const ChatSpace = ({ receiver_id, socket }) => {
  const bottomRef = useRef(null);
  const dispatch = useDispatch()
  const { userOnline: { onlineUser } } = useSelector(state => state)
  const token = localStorage.getItem('token')
  const [messages, setMessages] = useState([])
  const [profile, setProfile] = useState({})
  const [message, setMessage] = useState()
  const [me, setMe] = useState({})
  const [showProfile, setShowProfile] = useState(false)
  const profileBar = useRef(null)
  const [showMessageMenu, setShowMessageMenu] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState('')
  const input = useRef(null)
  const [isUpdate, setIsUpdate] = useState(false)


  const fetchMessage = async (token, receiver_id) => {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    if (receiver_id) {
      try {
        const result = await axios.get(process.env.REACT_APP_BACKEND_API + '/message/' + receiver_id, config)
        setMessages(result.data.data)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleDeleteMessage = async (id) => {
    Swal.fire({
      title: 'Sure to Delete this messages ?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Deleted",
          "Deleted success"
        )
        setMessages(messages.filter((data) => {
          return data.id !== id
        }))
      }
    });
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      const result = await axios.delete(process.env.REACT_APP_BACKEND_API + '/message/' + id, config)
      console.log(result.data.data)
    } catch (error) {
      console.log(error)
    }
  }



  const fetchMe = async (token) => {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      const result = await axios.get(process.env.REACT_APP_BACKEND_API + '/profile/', config)
      setMe(result.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchProfile = async (receiver_id) => {
    try {
      const result = await axios.get(process.env.REACT_APP_BACKEND_API + '/profile/' + receiver_id)
      setProfile(result.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleMessage = async () => {
    if (isUpdate) {
      try {
        await addMessage(message, selectedMessage)
        setIsUpdate(false)
        setMessage('')
      } catch (error) {
        console.log(error)
      }
    } else {
      const body = message
      const sender_id = me.id
      const now = new Date();
      const current = now.getHours() + ':' + now.getMinutes();
      socket.emit('sendMessage', { receiver_id, sender_id, body, time: current })
    }
  }

  useEffect(() => {
    setMessages([])
    fetchMessage(token, receiver_id)
    fetchProfile(receiver_id)
    fetchMe(token)
  }, [receiver_id])

  useEffect(() => {
    dispatch(userAction(token))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = async (message, id) => {
    if (id) {
      messages.map((data) => {
        if (data.id === id) {
          data.body = message
        }
      })
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const data = {
        body: message
      }
      try {
        const result = await axios.put(process.env.REACT_APP_BACKEND_API + '/message/' + id, data, config)
        console.log(result.data.data)
        setIsUpdate(false)
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        delete message.sender_id
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }
        const result = await axios.post(process.env.REACT_APP_BACKEND_API + '/message/add', message, config)
        const id = result.data.data.id
        console.log('id message = ' + id)
        return id
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleEditMessage = (id) => {
    setShowMessageMenu(false)
    messages.map(data => {
      if (data.id === id) {
        setMessage(data.body)
        input.current.focus()
        setIsUpdate(true)
      }
    })
  }

  const handleProfile = () => {
    if (showProfile) {
      const div = profileBar.current
      div.className = style.slideright
      return setTimeout(() => {
        setShowProfile(!showProfile)
      }, 200)
    }
    setShowProfile(!showProfile)
  }
  useEffect(() => {
    if (socket) {
      socket.off('incoming')
      socket.on('incoming', async (message) => {
        console.log('new Message coming')
        console.log(message)
        if ((message.sender_id === me.id && message.receiver_id === receiver_id) || (message.sender_id === receiver_id && message.receiver_id === me.id)) {
          const id = uuid()
          message.id = id
          setMessages((current) => [...current, message])
          if (message.sender_id === me.id) {
            await addMessage(message)
          }
        }
        setMessage('')
      })
    }
  }, [socket, addMessage, receiver_id])

  if (receiver_id) {
    return (
      <div className='d-flex flex-row'>
        <div className={style.chatspace}>
          <div className={style.headchat}>
            <img src={profile?.photo || calvin} alt="" id="photo" style={{
              borderRadius: "15px"
            }} />
            <div >
              <h5 onClick={handleProfile}>{profile ? profile.fullname : 'No Name'}</h5>
              {
                (onlineUser?.includes(receiver_id)) ? <span>User online</span> : <span style={{
                  color: "#c8cacf"
                }}>User offline</span>
              }

            </div>
            <img src={profilemenu} alt="" id="menu" />
          </div>
          <div className={style.bodychat}>
            {
              messages ? messages.map((data) => {
                return <div id="message" key={data.id} className={data.receiver_id !== receiver_id ? style.left : style.right}>{data.body}
                  <img div className={data.receiver_id !== receiver_id ? style.leftphoto : style.rightphoto} src={profile?.photo || calvin} width="50px" alt="" id="photo" style={{ borderRadius: "15px" }} />
                  <div id={data.id} onClick={(e) => {
                    setSelectedMessage(e.target.id)
                    setShowMessageMenu(!showMessageMenu)
                  }} className={style.dropicon}></div>
                  {
                    showMessageMenu && data.id == selectedMessage ?
                      <div className={`d-flex ${style.dropdownmenu}`}>
                        <p className={style.edit} onClick={() => handleEditMessage(data.id)}>Edit</p>
                        {/* <hr /> */}
                        <p className={style.delete} onClick={() => handleDeleteMessage(data.id)}>Delete</p>
                      </div>
                      : ""
                  }

                  <span style={{
                    position: 'relative',
                    fontSize: "9px",
                    display: 'block',
                    textAlign: data.receiver_id !== receiver_id ? "left" : "right"
                  }}>{data.time}</span>
                </div>
              }) : ''
            }
            <div ref={bottomRef} style={{
              visibility: 'hidden'
            }} />
          </div>
          <div className={style.chatinput}>
            <input type="text" placeholder='Type your message...' ref={input} value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={() => handleMessage()}>Send</button>
          </div>
        </div>
        {showProfile ?
          <div ref={profileBar} className={style.profile + " "}>
            <div className={style.profilesidebar}>
              <div className="username mb-5" style={{ color: "#7E98DF", fontSize: "23px" }}>@mmldolg</div>
              <img src={profile?.photo || calvin} alt="" style={{
                borderRadius: "25px"
              }} />
              <div className={`row ${style.sideprofile}`}>
                <h5>{profile ? profile.fullname : 'No Name'}</h5>
                {
                  (onlineUser?.includes(receiver_id)) ? <span>User online</span> : <span style={{
                    color: "#c8cacf", marginLeft: "10px"
                  }}>User offline</span>
                }
                <h5 className='mt-3'>Phone number </h5>
                {profile?.phone ? <a style={{ color: "black", marginTop: "18px", marginLeft: "10px" }} href="tel:{profile?.phone}">{profile?.phone}</a> : <p>No Phone</p>}
              </div>
            </div>
          </div>
          : ""}
      </div>
    )
  }
  else {
    return (
      <div className="d-flex h-100">
      </div>
    )
  }
}

export default ChatSpace