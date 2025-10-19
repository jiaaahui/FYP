import React from 'react';
import { autoScheduler, orders } from '../../services/scheduler';

export default function DummySchedulerPage() {
  const handleRunScheduler = () => {
    autoScheduler();
    alert("Scheduler run! Check console for results.");
  };

  return (
    <div>
      <h1>Dummy AutoScheduler</h1>
      <button onClick={handleRunScheduler}>Run Auto Scheduler</button>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
    </div>
  );
}