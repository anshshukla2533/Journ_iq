import React, { useRef, useEffect } from 'react';

export default function CallOverlay({ callType, onEnd, remoteStream, localStream, status }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4 min-w-[350px] relative">
        <div className="text-xl font-bold mb-2 capitalize">{callType} Call</div>
        <div className="mb-2 text-gray-600">{status}</div>
        <div className="flex gap-4 items-center">
          {callType === 'video' && (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-40 bg-black rounded-lg" />
              <video ref={localVideoRef} autoPlay playsInline muted className="w-24 h-16 bg-gray-800 rounded-lg absolute bottom-8 right-8 border-2 border-white" style={{zIndex: 2}} />
            </>
          )}
          {callType === 'audio' && (
            <>
              <audio ref={remoteVideoRef} autoPlay />
              <audio ref={localVideoRef} autoPlay muted />
            </>
          )}
        </div>
        <button
          className="bg-red-600 text-white px-6 py-2 rounded-full mt-4 hover:bg-red-700"
          onClick={onEnd}
        >End Call</button>
      </div>
    </div>
  );
}
