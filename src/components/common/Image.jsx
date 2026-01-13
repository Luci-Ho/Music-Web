import { useState } from "react";

export default function Image(props) {
  const { src, alt = "", ...rest } = props;
  const [error, setError] = useState(false);

  return (
    <img
      src={!src || error ? "/images/none.jpg" : src}
      alt={alt}
      onError={() => setError(true)}
      {...rest}
    />
  );
}
