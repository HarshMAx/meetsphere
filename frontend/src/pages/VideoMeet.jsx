import React, { useEffect, useRef, useState } from 'react'
import "../styles/videoComponent.css"
import { Button, TextField } from '@mui/material';
import io from "socket.io-client";

// Nodejs Url
const serverUrl = import.meta.env.VITE_SERVER_URL;
// console.log(serverUrl,"ths")

let connection = {}

let peerConfigConnection = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

const VideoMeet = () => {
    // let connection = useRef({});

    const socketRef = useRef(null);
    const socketIdRef = useRef();
    const localVideoRef = useRef()
    let [videoAvailable, setVideoAvailable] = useState(true)
    let [audioAvailable, setAudioAvailable] = useState(true)
    let [video,setVideo] = useState([])
    let [audio,setAudio] = useState()
    let [screen,setScreen] = useState()
    let [showModel,setShowModel] = useState()
    let [screenAvailable,setScreenAvailable] = useState()
    let [messages , setMessages] = useState([])
    let [message,setMessage] = useState()
    let [newMessage,setNewMessage] = useState(0)
    let [askForUserName , setAskForUserName] = useState(true)
    let [userName , setUserName] = useState("")

    const videoRef = useRef([])
    let [videos,setVideos] = useState([])

    // if(isChrome() == false){
    //     console.log("Please use chrome for better experience")
    // }

    const getPermissions = async() => {
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true})
            if(videoPermission){
                setVideoAvailable(true)
            }else{
                setVideoAvailable(false)
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true})
            if(audioPermission){
                setAudioAvailable(true)
            }else{
                setAudioAvailable(false)
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true)
            }else{
                setScreenAvailable(false)
            }

            if(audioAvailable || videoAvailable ){
                const userMediaStream  = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable})

                if(userMediaStream){
                    window.localStream = userMediaStream
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }


        }catch(err){
            console.error("Error getting user media:", err);
        }

    }
    useEffect(()=>{
        getPermissions()
    },[])

    let getUserMediaSuccess = (stream) => {

    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video:video,audio:audio})
            .then(()=>{getUserMediaSuccess})
            .catch((e)=>{
                console.log(e)
            })
        }else{
            try{
                let tracks = localVideoRef.current.srcObject.getTrackes();
                tracks.forEach(track => track.stop())
            }catch(e){
                console.log(e)
            }
        }

    }

    useEffect(()=>{
        if(video !== undefined && audio !== undefined){
            getUserMedia()
        }
    },[audio,video])

    let getMessageFromServer = (fromId,message) => {

    }

    let addMessage = () => {

    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(serverUrl,{secure:false})
        socketRef.current.on('signal',getMessageFromServer)
        socketRef.current.on('connect', () => {
            socketRef.current.emit("join-call",window.location.href)

            socketIdRef.current = socketRef.current.id
            socketRef.current.on("chat-message",addMessage)
            socketRef.current.on("user-left",(id)=>{
                setVideo((videos)=>{
                    videos.filter((video)=>{
                        video.socketId !== id
                    })
                })
            })

            socketRef.current.on("user-joined",(id,clients)=>{
                clients.forEach((socketListId)=>{
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnection)
                    connections[socketListId].onicecandidate = (event) => {
                        if(event.candidate != null){
                            socketRef.current.emit("signal",socketListId,JSON.stringify({'ice' : event.candidate}))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId == socketListId)

                        if (videoExists) {
                            setVideo(video => {
                                const updateVideos = video.map(video => {
                                    video.socketId == socketListId ? { ...video, stream: event.stream } : video
                                })
                                videoRef.current = updateVideos
                                return updateVideos
                            })
                        }else{
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay:true,
                                playsinline:true,
                                
                            }
                            setVideos(video=>{
                                const updatedVideos = [...videos,newVideo]
                                videoRef.current = updatedVideos
                                return updatedVideos;
                            })
                        }
                    }

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let getMedia = () => {
        setVideo(videoAvailable),
        setAudio(audioAvailable)
        connectToSocketServer()
    }

    let connect = () => {
        setAskForUserName(false)
        getMedia()
    }




    return (
        <div>
            {askForUserName ? <div>
                <h2>
                    Enter into Lobby
                </h2>
                <TextField id="outlined-basic" label="User Name" value={userName}
                    onChange={(e) => setUserName(e.target.value)} variant="outlined"  />

                    <Button
                    variant="contained"
                    onClick={connect}
                    >Connect</Button>   
                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>
            </div>
                :
                <div>

                </div>}
        </div>
    )
}

export default VideoMeet