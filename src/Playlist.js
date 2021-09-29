import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Cloudinary } from "cloudinary-core";
import "cloudinary-video-player/dist/cld-video-player.light.min";
import "cloudinary-video-player/dist/cld-video-player.light.min.css";

const emojiReactions = [
  {
    content: "a",
    time: 2
  },
  {
    content: "b",
    time: 4
  },
  {
    content: "c",
    time: 6
  },
  {
    content: "d",
    time: 8
  }
];

function VideoPlayerFunction(props) {
  // const [mounted, setIsMounted] = useState(false);
  const [videoParentNode, setVideoParentNode] = useState(null);
  const [videoControlsNode, setVideoControlsNode] = useState(null);
  const [playerObj, setPlayerObj] = useState(null);
  const [playerDuration, setPlayerDuration] = useState(null);

  const [reactions, setReactions] = useState(emojiReactions);
  const [liveReactions, setLiveReactions] = useState([
    { content: "hey", time: 0 }
  ]);

  // keep track of whether video control is visible
  const [userActive, setUserActive] = useState(false);

  const cld = new Cloudinary({
    cloud_name: props.options.cloudName,
    secure: true
  });

  // setup an event handler to be called at every second of the video
  const runPerVideoSecond = (videoPlayerObj, func) => {
    let currentIntTime = 0;

    // leaky abstraction
    videoPlayerObj.on("timeupdate", () => {
      if (parseInt(videoPlayerObj.currentTime()) > currentIntTime) {
        currentIntTime++;
        func(currentIntTime);
      }
    });
  };

  function videoPlayerInit() {
    const player = cld.videoPlayer("example-player", {
      controls: true,
      // bigPlayButton: false,
      playbackRates: ["0.5", "1.0", "1.25", "1.5", "1.75", "2.0"],
      showLogo: true,
      colors: {
        accent: "f7bc00"
      },
      transformation: { fetch_format: "auto", quality: "auto" },
      fluid: true,
      showJumpControls: true,
      floatingWhenNotVisible: "left"
    });

    player.source(
      "https://res.cloudinary.com/greenpeg/video/upload/v1590960158/samples/sea-turtle.mp4"
    );

    // make video player object available to function component scope after initialization
    setPlayerObj(player);

    // safely get video duration when metadata has loaded
    player.videojs.on("loadedmetadata", () =>
      setPlayerDuration(player.duration())
    );

    // useractive event(from videojs) checks for when the video controls are shown and hidden
    player.videojs.on("useractive", () => {
      setUserActive(player.videojs.userActive());
    });

    // handle live reactions update
    runPerVideoSecond(player, (currentIntTime) => {
      const liveReactionsList = []; //needs better name

      reactions.forEach((rxn) => {
        if (rxn.time < currentIntTime) {
          liveReactionsList.push(rxn);
          console.log("!pushed");
        }

        // make the latest reaction(at current time) 'pop'
        if (rxn.time === currentIntTime) {
          rxn.active = true;
          liveReactionsList.push(rxn);
        }
      });

      // troubleshooting: state is being updated
      // I have a feeling this whole thing has something
      // to do with react portals
      setLiveReactions(liveReactionsList);

      // troubleshooting: referencing stale value?? yes
      // but that isn't quite the issue here
      console.log("live reactions list:", liveReactions);
    });

    // make player object global so it can be inspected
    window.player = player;
  }

  useEffect(() => {
    return videoPlayerInit();
  }, []);

  useEffect(() => {
    console.log("liveReactions updating... ", liveReactions);
  }, [liveReactions]);

  useEffect(() => {
    // setIsMounted(true); // may not be necessary but let's watch!
    const videoParent = document.querySelector(".cld-video-player");
    const videoControls = document.querySelector(
      ".cld-video-player .vjs-control-bar"
    );

    setVideoParentNode(videoParent);
    setVideoControlsNode(videoControls);
  }, []);

  return (
    <>
      <video id="example-player" />
      {playerDuration && (
        <EmojiTimeline
          videoParentNode={videoParentNode}
          videoControlsNode={videoControlsNode}
        >
          {liveReactions.map((rxn) => {
            // the rerender is receiving the latest state value
            console.log("live reactions render value --> ", liveReactions);
            return (
              <div
                className="emoji-timeline-reaction"
                style={{ left: `${(rxn.time / playerObj.duration()) * 100}%` }}
                // style={{ color: "red" }}
              >
                {rxn.content}
              </div>
            );
          })}
        </EmojiTimeline>
      )}
    </>
  );
}

function EmojiTimeline({ videoParentNode, videoControlsNode, children }) {
  const el = document.createElement("div");
  el.className = "emoji-timeline";

  console.log("###=>", "portal renderer!", { children });

  useEffect(() => {
    videoParentNode.insertBefore(el, videoControlsNode);
    console.log("--> running effect!");

    return () => videoParentNode.removeChild(el);
  }, []);

  return ReactDOM.createPortal(children, el);
}

export default VideoPlayerFunction;
