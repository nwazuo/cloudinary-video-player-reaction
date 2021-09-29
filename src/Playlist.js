import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Cloudinary } from 'cloudinary-core';
import 'cloudinary-video-player/dist/cld-video-player.light.min';
import 'cloudinary-video-player/dist/cld-video-player.light.min.css';

const emojiURLs = {
  love: 'https://res.cloudinary.com/udemic/image/upload/v1632935667/hackmamba-emoji/love.png',
  down: 'https://res.cloudinary.com/udemic/image/upload/v1632935647/hackmamba-emoji/down.png',
  joy: 'https://res.cloudinary.com/udemic/image/upload/v1632935531/hackmamba-emoji/joy.png',
  up: 'https://res.cloudinary.com/udemic/image/upload/v1632935479/hackmamba-emoji/up.png',
  wow: 'https://res.cloudinary.com/udemic/image/upload/v1632935437/hackmamba-emoji/wow.png',
  yay: 'https://res.cloudinary.com/udemic/image/upload/v1632935235/hackmamba-emoji/yay.png',
};

const emojiReactions = [
  {
    content: 'love',
    time: 2,
  },
  {
    content: 'down',
    time: 3,
  },
  {
    content: 'love',
    time: 4,
  },
  {
    content: 'joy',
    time: 5,
  },
  {
    content: 'up',
    time: 6,
  },
  {
    content: 'wow',
    time: 8,
  },
  {
    content: 'yay',
    time: 9,
  },
  {
    content: 'up',
    time: 11,
  },
  {
    content: 'up',
    time: 15,
  },
];

function VideoPlayerFunction(props) {
  const [playerObj, setPlayerObj] = useState(null);
  const [playerDuration, setPlayerDuration] = useState(null);

  const [reactions, setReactions] = useState(emojiReactions);
  const [liveReactions, setLiveReactions] = useState([]);

  // keep track of whether video control is visible
  const [userActive, setUserActive] = useState(false);

  const cld = new Cloudinary({
    cloud_name: props.options.cloudName,
    secure: true,
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
    runPerVideoSecond(player, (currentIntTime) => {
      const liveReactionsList = []; //needs better name

      reactions.forEach((rxn) => {
        if (rxn.time < currentIntTime) {
          liveReactionsList.push(rxn);
        }

        // make the latest reaction(at current time) 'pop'
        if (rxn.time === currentIntTime) {
          // make copy of current active rxn and make its active key = true
          let activeRxn = { ...rxn };
          activeRxn.active = true;
          liveReactionsList.push(activeRxn);
        }
      });

      setLiveReactions(liveReactionsList);

      // console.log('displayed reactions: ', { liveReactionsList });
      console.log('current time: ', currentIntTime);
    });

    // make player object global so it can be inspected
    window.player = player;
  }

  useEffect(() => {
    return videoPlayerInit();
  }, []);

  return (
    <>
      <video id="example-player" />
      {playerDuration && (
        <EmojiTimeline>
          {userActive
            ? reactions.map((rxn) => {
                // make the 'emoji-timeline-reaction' element into a react component...

                return (
                  <div
                    className={`emoji-timeline-reaction control-visible `}
                    style={{
                      left: `${(rxn.time / playerObj.duration()) * 100}%`,
                    }}
                  >
                    <img
                      src={emojiURLs[rxn.content]}
                      alt={rxn.content}
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
                      src={emojiURLs[rxn.content]}
                      alt={rxn.content}
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
