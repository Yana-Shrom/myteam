import './App.css';
import { useRef, useState } from 'react';

function App() {

  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const constraints = {
    'video': true,
    'audio': true
  }
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if( videoRef.current){
        videoRef.current.srcObjet = stream;
      }
      setIsStreaming(true);
    } catch(err){
      console.error("Error");
    }
  }

  return (
    <div className="App">
      <button onClick={startCamera} disabled={isStreaming}>
        {isStreaming ? "Caméra activée" : "Démarrer la caméra"}
      </button>
      <video ref={videoRef} autoPlay style={{width:"640px", height: "480px", backgroundColor:"#000"}}></video>
    </div>
  );
}

export default App;
