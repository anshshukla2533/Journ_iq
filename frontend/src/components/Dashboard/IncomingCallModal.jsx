import React from 'react';

export default function IncomingCallModal({ caller, callType, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4 min-w-[300px]">
        <div className="text-2xl font-bold mb-2">Incoming {callType === 'video' ? 'Video' : 'Audio'} Call</div>
        <div className="text-lg mb-4">From: <span className="font-semibold">{caller?.name || 'Unknown'}</span></div>
        <div className="flex gap-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={onAccept}
          >Accept</button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onReject}
          >Reject</button>
        </div>
      </div>
    </div>
  );
}