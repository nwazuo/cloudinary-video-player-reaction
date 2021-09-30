import './styles.css';
import Playlist from './Player';

import { ChakraProvider } from '@chakra-ui/react';

import { Box, Text } from '@chakra-ui/react';

export default function App() {
  const videoOptions = {
    cloudName: 'greenpeg',
    // publicId: ["samples/sea-turtle"],
    // tag: "video-player-playlist"
  };

  return (
    <ChakraProvider>
      <div className="App">
        <Text fontSize="5xl" fontWeight="bold" textAlign="center">
          Video Timeline Emoji Reactions With Cloudinary Video Player
        </Text>
        {
          <Box className="video-card" mx="15px">
            <div className="vp">
              <Playlist options={videoOptions} />
              <div id="engagement-bar"></div>
            </div>
          </Box>
        }
      </div>
    </ChakraProvider>
  );
}
