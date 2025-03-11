import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const useCountdownTimer = (targetDate: string) => {
  const calculateTimeLeft = () => {
    const now = dayjs();
    const target = dayjs(targetDate);
    const difference = target.diff(now, 'second'); // Get difference in seconds

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }; // Countdown finished
    }

    const days = Math.floor(difference / (60 * 60 * 24));
    const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((difference % (60 * 60)) / 60);
    const seconds = difference % 60;

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [targetDate]); // Re-run if target date changes

  return timeLeft;
};

export default useCountdownTimer;