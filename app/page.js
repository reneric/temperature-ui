// app/page.js

import TemperatureGraph from '../components/TemperatureGraph';

export default function Home() {
  return (
    <div className="container mx-auto p-2">
      <TemperatureGraph />
    </div>
  );
}
