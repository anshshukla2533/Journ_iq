import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Friends from '../components/chat/Friends';
import Chat from '../components/chat/Chat';

export default function ChatPage() {
  const location = useLocation();
  const [chatFriend, setChatFriend] = useState(null);
  const [pendingShare, setPendingShare] = useState(null);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.chatFriend) {
      setChatFriend(location.state.chatFriend);
      setPendingShare({
        draft: location.state.draftMessage || '',
        noteId: location.state.sharedNoteId || null,
        noteTitle: location.state.sharedNoteTitle || '',
        alreadyShared: Boolean(location.state.sharedNoteAlreadyShared),
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="animate-fade-in flex h-[calc(100vh-140px)] flex-col">
      <div className="relative flex flex-1 overflow-hidden rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdf8_0%,#f7f0e5_55%,#f3ebdd_100%)] shadow-[0_24px_80px_rgba(122,92,56,0.12)]">
        <div className="absolute -left-8 top-16 h-28 w-28 rounded-full bg-[#d9b88c]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-[#b7c39a]/20 blur-3xl" />

        <div className={`z-10 border-b border-[#eadfce] bg-white/70 backdrop-blur-sm lg:w-[380px] lg:border-b-0 lg:border-r ${chatFriend ? 'hidden lg:block' : 'block w-full'}`}>
          <Friends
            onFriendsLoaded={(friends, isLoading) => {
              setFriendsLoading(isLoading);
              if (!isLoading && !chatFriend && !pendingShare && friends.length === 1) {
                setChatFriend(friends[0]);
              }
            }}
            onStartChat={friend => {
              setPendingShare(null);
              setChatFriend(friend);
            }}
          />
        </div>

        <div className={`z-10 flex flex-1 flex-col ${!chatFriend ? 'hidden lg:flex' : 'flex'}`}>
          {chatFriend ? (
            <div className="flex h-full flex-1 overflow-hidden">
              <div className="shrink-0 border-b border-[#eadfce] bg-white/80 p-3 lg:hidden">
                <button
                  onClick={() => setChatFriend(null)}
                  className="flex items-center text-sm font-medium text-[#8d6948] transition hover:text-[#2f2720]"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Friends
                </button>
              </div>
              <div className="h-full flex-1 overflow-hidden">
                <Chat
                  friend={chatFriend}
                  onClose={() => setChatFriend(null)}
                  initialDraft={pendingShare?.draft || ''}
                  initialNoteId={pendingShare?.noteId || null}
                  initialNoteTitle={pendingShare?.noteTitle || ''}
                  initialNoteAlreadyShared={pendingShare?.alreadyShared || false}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] p-8">
              {friendsLoading ? (
                <div className="w-full max-w-md space-y-4">
                  <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-white/70" />
                  <div className="mx-auto h-4 w-40 animate-pulse rounded-full bg-white/70" />
                  <div className="mx-auto h-3 w-56 animate-pulse rounded-full bg-white/50" />
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-[#b88455] shadow-[0_12px_30px_rgba(184,132,85,0.14)]">
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3C6.48 3 2 6.8 2 11.5c0 2.8 1.63 5.3 4.14 6.8.07.24.18.7.27 1.34.1 1.05-.28 2.37-1.12 3.4 1.35-.14 3.06-.7 4.54-1.92 1.48.33 3.03.54 4.67.54 5.52 0 10-3.8 10-8.5S17.52 3 12 3z" />
                    </svg>
                  </div>
                  <p className="font-['Sora'] text-xl font-semibold text-[#2f2720]">Open a chat</p>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-[#73685d]">
                    Pick someone from the left and the conversation will stay here, like one stable messaging screen.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
