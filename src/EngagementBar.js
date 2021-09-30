import React from 'react';

import { Button, ButtonGroup, IconButton } from '@chakra-ui/react';

import { emojiURLs } from './data';

function EngagementBar({
  currentReactions,
  updateReactions,
  videoPlayerObj,
  updateLiveReactions,
}) {
  const handleUpdateReactions = (emoji) => {
    let currentIntTime = parseInt(videoPlayerObj.videojs.currentTime());
    let emojiReaction = {
      type: emoji,
      time: currentIntTime,
      active: true,
    };
    let updatedReactions = [...currentReactions, emojiReaction];

    updateReactions(updatedReactions);

    updateLiveReactions(currentIntTime);

    console.log({ emojiReaction });
  };

  return (
    <ButtonGroup size="lg" isAttached variant="outline" my="4">
      {Object.keys(emojiURLs).map((emoji) => (
        <Button mr="-px" onClick={() => handleUpdateReactions(emoji)}>
          <img src={emojiURLs[emoji]} width="50%" />
        </Button>
      ))}
    </ButtonGroup>
  );
}

export default EngagementBar;
