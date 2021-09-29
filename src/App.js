import "./styles.css";
import Playlist from "./Playlist";

export default function App() {
  const videoOptions = {
    cloudName: "greenpeg",
    // publicId: ["samples/sea-turtle"],
    // tag: "video-player-playlist"
  };

  return (
    <div className="App">
      <h2>Start editing to see some magic happen!</h2>
      {
        <div className="video-card">
          <div className="vp">
            <Playlist options={videoOptions} />
          </div>
        </div>
      }
    </div>
  );
}
