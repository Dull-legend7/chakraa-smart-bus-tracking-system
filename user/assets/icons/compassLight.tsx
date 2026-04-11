import Svg, { Path } from 'react-native-svg';

export function CompassLight() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v2H9v2h2v2h2v-2h2v-2h-2V7zm0 6h-2v2H9v-2H7v-2h2v-2h2v2h2v2h-2v2z"
        stroke="#8F8F8F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

