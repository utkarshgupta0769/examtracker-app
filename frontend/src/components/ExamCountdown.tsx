import { useMemo, useEffect, useState } from 'react';
import type { Exam } from '../backend';
import { Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExamCountdownProps {
  exam: Exam;
}

export default function ExamCountdown({ exam }: ExamCountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const countdown = useMemo(() => {
    const examDate = Number(exam.date) / 1000000; // Convert nanoseconds to milliseconds
    const diff = examDate - now;

    if (diff < 0) {
      return { text: 'Past', urgent: false, days: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
      return { text: `${hours}h`, urgent: true, days: 0 };
    } else if (days === 1) {
      return { text: '1 day', urgent: true, days: 1 };
    } else if (days <= 7) {
      return { text: `${days} days`, urgent: true, days };
    } else {
      return { text: `${days} days`, urgent: false, days };
    }
  }, [exam.date, now]);

  const examDateObj = new Date(Number(exam.date) / 1000000);
  const formattedDate = examDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex-1">
        <h4 className="font-semibold">{exam.subject}</h4>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {formattedDate} at {exam.time}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {countdown.urgent && countdown.days <= 7 && (
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        )}
        <Badge
          variant={countdown.urgent ? 'destructive' : 'secondary'}
          className="text-sm font-semibold"
        >
          {countdown.text}
        </Badge>
      </div>
    </div>
  );
}
