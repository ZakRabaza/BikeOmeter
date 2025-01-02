import { useState, useEffect, useContext } from "react";

import StartStopContext from "../../hooks/startStopContext";
import PauseContext from "../../hooks/pauseContext";

function StopWatchTimer({ setTimeData }) {
  const [isActive] = useContext(StartStopContext);
  const [pauseStatus] = useContext(PauseContext);

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && !pauseStatus) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
      setTimeData(seconds);
    } else if (isActive && pauseStatus) {
      clearInterval(interval);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isActive, pauseStatus, seconds]);
}

export default StopWatchTimer;
