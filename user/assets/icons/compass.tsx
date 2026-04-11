import Svg, { Path } from 'react-native-svg';

interface CompassProps {
  width?: number;
  height?: number;
  colors?: string;
  fill?: string;
}

export default function Compass({ width = 24, height = 24, colors = '#000', fill = '#000' }: CompassProps) {
  return (
    <Svg viewBox="0 0 24 24" width={width} height={height}>
      <Path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v2H9v2h2v2h2v-2h2v-2h-2V7zm0 6h-2v2H9v-2H7v-2h2v-2h2v2h2v2h-2v2z" 
        fill={fill}
      />
      <Path 
        d="M12 5c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
        fill={colors}
        opacity="0.3"
      />
    </Svg>
  );
}

