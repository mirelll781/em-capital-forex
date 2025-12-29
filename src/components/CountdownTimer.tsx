import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set target date to 7 days from now (resets on page load for demo purposes)
    // In production, you'd want to store this in localStorage or database
    const getTargetDate = () => {
      const stored = localStorage.getItem("mentorship_countdown_target");
      if (stored) {
        const target = new Date(stored);
        if (target > new Date()) {
          return target;
        }
      }
      // Set new target 7 days from now
      const newTarget = new Date();
      newTarget.setDate(newTarget.getDate() + 7);
      localStorage.setItem("mentorship_countdown_target", newTarget.toISOString());
      return newTarget;
    };

    const targetDate = getTargetDate();

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-background/50 backdrop-blur-sm border border-success/30 rounded-lg px-3 py-2 min-w-[50px]">
        <span className="text-xl font-bold text-success font-mono">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase mt-1">{label}</span>
    </div>
  );

  return (
    <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-success animate-pulse" />
        <p className="text-sm font-semibold text-success">Ograničen Broj Mjesta!</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Preostalo vrijeme za prijavu po trenutnoj cijeni:
      </p>
      <div className="flex justify-center gap-2">
        <TimeBlock value={timeLeft.days} label="Dana" />
        <span className="text-success font-bold self-start mt-3">:</span>
        <TimeBlock value={timeLeft.hours} label="Sati" />
        <span className="text-success font-bold self-start mt-3">:</span>
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <span className="text-success font-bold self-start mt-3">:</span>
        <TimeBlock value={timeLeft.seconds} label="Sek" />
      </div>
    </div>
  );
};

export default CountdownTimer;
