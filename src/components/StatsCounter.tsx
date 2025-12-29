import { useEffect, useState, useRef } from "react";

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const Counter = ({ end, suffix = "", prefix = "", duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="text-gradient-gold font-heading font-bold text-4xl md:text-5xl">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const stats = [
  { value: 85, suffix: "%+", label: "Točnost Signala" },
  { value: 5000, suffix: "+", label: "Aktivnih Članova" },
  { value: 250, prefix: "€", suffix: "K+", label: "Mjesečni Profit" },
  { value: 3, suffix: " Godine", label: "Iskustva" },
];

const StatsCounter = () => {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Counter 
                end={stat.value} 
                suffix={stat.suffix} 
                prefix={stat.prefix} 
              />
              <p className="text-muted-foreground mt-2 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
