import React from "react";

export const VideoPlayer = ({ uri, style }: { uri?: string; style: any }) => {
  return (
    <video src={uri} style={style} controls preload="metadata" className="rounded-lg">
      Your browser does not support the video tag.
    </video>
  );
};
