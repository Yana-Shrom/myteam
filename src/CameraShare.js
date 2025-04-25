import React, { useEffect, useState, useRef} from 'react';

const  CameraShare = () => {
    const videoRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    
    useEffect(() => {

        const getUserMedia = async () => {
            try {
                const constraints = {
                    'video': true
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObjet = stream;
                }
                setIsStreaming(true);

            }catch(err){
                console.error("Erreur : ", err);
            }
            
        };
        getUserMedia();
        return () => {
            if (videoRef.current &&  videoRef.current.srcObjet) {
                const stream = videoRef.current.srcObjet;
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, []);
 
  return (
    <div className="App">
      <h1>Partage de la camera</h1>
      {isStreaming ? (
        <video ref={videoRef} autoPlay playsInline controls={false} style={{width:"640px", height: "480px"}}></video>
      ) : (<p>Chargement de la caméra...</p>)
      }
      
    </div>
  );
};

export default CameraShare;
