import './App.css';
import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://192.168.1.122:3001');

function App() {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    socket.on('offer', async (offer) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', (answer) => {
      peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('candidate', (candidate) => {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [remoteStream]);

  const startStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
    setIsStreaming(true);

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit('offer', offer);
  };

  const handleStream = () => {
    setIsViewer(false);
    setIsStreaming(true);
    startStream();
  };

  const handleView = () => {
    setIsStreaming(false);
    setIsViewer(true);
  };

  return (
    <div className="App">
      {!isStreaming && !isViewer && (
        <div>
          <button onClick={handleStream}>Stream</button>
          <button onClick={handleView}>Spectateur</button>
        </div>
      )}
      {isStreaming && (
        <video
          id="localVideo"
          ref={videoRef}
          autoPlay
          playsInline
          controls={true}
          style={{ width: "640px", height: "480px", backgroundColor: "#000" }}
        ></video>
      )}
      {isViewer && remoteStream && (
        <video
          id="remoteVideo"
          autoPlay
          playsInline
          controls={true}
          style={{ width: "640px", height: "480px", backgroundColor: "#000" }}
          srcObject={remoteStream}
        ></video>
      )}
    </div>
  );
}

export default App;
