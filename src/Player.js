import React, { useEffect, useState, useRef } from 'react';
import usePortal from 'react-useportal';
import { Cloudinary } from 'cloudinary-core';
import 'cloudinary-video-player/dist/cld-video-player.light.min';
import 'cloudinary-video-player/dist/cld-video-player.light.min.css';

import EngagementBar from './EngagementBar';

import { emojiURLs, emojiReactions } from './data';

function VideoPlayerFunction(props) {
  const [playerObj, setPlayerObj] = useState(null);
  const [playerDuration, setPlayerDuration] = useState(null);

  const [reactions, _setReactions] = useState(emojiReactions);

  const reactionsRef = useRef(reactions);
  const setReactions = (data) => {
    reactionsRef.current = data;
    _setReactions(data);
  };

  const [liveReactions, setLiveReactions] = useState([]);

  // keep track of whether video control is visible
  const [userActive, setUserActive] = useState(false);

  const cld = new Cloudinary({
    cloud_name: props.options.cloudName,
    secure: true,
  });

  const { Portal } = usePortal({
    bindTo: document && document.getElementById('engagement-bar'),
  });

  // setup an event handler to be called at every second of the video
  const runPerVideoSecond = (videoPlayerObj, func) => {
    let currentIntTime = 0;

    // BUG: currentIntTime does not update on video seek...
    // TODO: create an event handler for the 'seek' event to reset the currentIntTime on seek
    // Probable add this as flaws in the article that are fixed in the github repo version to keep the article simple

    videoPlayerObj.on('seeked', () => {
      currentIntTime = parseInt(videoPlayerObj.currentTime());
    });

    // leaky abstraction
    videoPlayerObj.on('timeupdate', () => {
      if (parseInt(videoPlayerObj.currentTime()) > currentIntTime) {
        currentIntTime++;
        func(currentIntTime);
      }
    });
  };

  function handleLiveReactionsUpdate(currentIntTime) {
    const liveReactionsList = []; //needs better name

    console.log('reactions modified ?', reactionsRef.current);

    reactionsRef.current.forEach((rxn) => {
      let activeRxn = { ...rxn };
      activeRxn.active = false; //
      if (rxn.time < currentIntTime) {
        liveReactionsList.push(activeRxn);
      }

      // make the latest reaction(at current time) 'pop'
      if (rxn.time === currentIntTime) {
        // make copy of current active rxn and make its active key = true
        let activeRxn = { ...rxn };
        activeRxn.active = true;
        liveReactionsList.push(activeRxn);
      }
    });

    console.log('after active:false =>', liveReactionsList);
    setLiveReactions(liveReactionsList);

    // console.log('displayed reactions: ', { liveReactionsList });
    console.log('current time: ', currentIntTime);
  }

  function videoPlayerInit() {
    const player = cld.videoPlayer('example-player', {
      controls: true,
      colors: {
        accent: 'f7bc00',
      },
      fluid: true,
      showJumpControls: true,
    });

    player.source(
      'https://res.cloudinary.com/greenpeg/video/upload/v1590960158/samples/sea-turtle.mp4'
    );

    // make video player object available to function component scope after initialization
    setPlayerObj(player);

    // WRITING: I could organize the article to highlight all the useful events we'd be watching for and why

    // safely get video duration when metadata has loaded
    player.videojs.on('loadedmetadata', () =>
      setPlayerDuration(player.duration())
    );

    // set userActive to true when video is first played
    player.videojs.one('play', () => {
      setUserActive(true);
    });

    // useractive event(from videojs) checks for when the video controls are shown and hidden
    player.videojs.on('useractive', () => {
      setUserActive(player.videojs.userActive());
    });

    player.videojs.on('userinactive', () => {
      setUserActive(player.videojs.userActive());
    });

    // handle live reactions update
    runPerVideoSecond(player, handleLiveReactionsUpdate);

    // make player object global so it can be inspected
    window.player = player;
  }

  useEffect(() => {
    return videoPlayerInit();
  }, []);

  return (
    <>
      <video id="example-player" />
      <Portal>
        <EngagementBar
          currentReactions={reactions}
          updateReactions={setReactions}
          updateLiveReactions={handleLiveReactionsUpdate}
          videoPlayerObj={playerObj}
        />
      </Portal>
      {playerDuration && (
        <EmojiTimeline>
          {userActive
            ? reactionsRef.current.map((rxn) => {
                // make the 'emoji-timeline-reaction' element into a react component...

                return (
                  <div
                    className={`emoji-timeline-reaction control-visible `}
                    style={{
                      left: `${(rxn.time / playerObj.duration()) * 100}%`,
                    }}
                  >
                    <img
                      src={emojiURLs[rxn.type]}
                      alt={rxn.type}
                      width="16px"
                    />
                  </div>
                );
              })
            : liveReactions.map((rxn) => {
                return (
                  <div
                    className={`emoji-timeline-reaction ${
                      rxn.active ? 'active' : ''
                    } `}
                    style={{
                      left: `${(rxn.time / playerObj.duration()) * 100}%`,
                    }}
                  >
                    <img
                      src={emojiURLs[rxn.type]}
                      alt={rxn.type}
                      width="16px"
                    />
                  </div>
                );
              })}
        </EmojiTimeline>
      )}
    </>
  );
}

function EmojiTimeline({ children }) {
  const el = document.createElement('div');
  el.className = 'emoji-timeline';

  return <div className="emoji-timeline">{children}</div>;
}

export default VideoPlayerFunction;
