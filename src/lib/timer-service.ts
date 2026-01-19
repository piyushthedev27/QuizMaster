export interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}

export type TimerCallback = (timeRemaining: number) => void;
export type TimeoutCallback = () => void;

export class TimerService {
  private static readonly QUESTION_DURATION = 10; // 10 seconds per question
  private intervalId: NodeJS.Timeout | null = null;
  private timeRemaining: number = TimerService.QUESTION_DURATION;
  private isActive: boolean = false;
  private isPaused: boolean = false;
  private onTick: TimerCallback | null = null;
  private onTimeout: TimeoutCallback | null = null;

  constructor(onTick?: TimerCallback, onTimeout?: TimeoutCallback) {
    this.onTick = onTick || null;
    this.onTimeout = onTimeout || null;
  }

  /**
   * Start the countdown timer for a question
   */
  start(): void {
    if (this.isActive && !this.isPaused && this.intervalId) {
      return; // Already running
    }

    this.isActive = true;
    this.isPaused = false;
    
    // Reset timer if starting fresh
    if (this.timeRemaining <= 0) {
      this.timeRemaining = TimerService.QUESTION_DURATION;
    }

    console.log('Timer starting with', this.timeRemaining, 'seconds');

    // Clear any existing interval first
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      if (this.isPaused) return;

      this.timeRemaining -= 1;
      console.log('Timer tick:', this.timeRemaining);
      
      // Notify tick callback
      if (this.onTick) {
        this.onTick(this.timeRemaining);
      }

      // Check for timeout
      if (this.timeRemaining <= 0) {
        console.log('Timer reached zero, triggering timeout');
        this.handleTimeout();
      }
    }, 1000);
  }

  /**
   * Stop the timer
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    this.isPaused = false;
  }

  /**
   * Pause the timer
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the timer
   */
  resume(): void {
    if (this.isActive) {
      this.isPaused = false;
    }
  }

  /**
   * Reset timer to full duration
   */
  reset(): void {
    this.stop();
    this.timeRemaining = TimerService.QUESTION_DURATION;
  }

  /**
   * Reset and start timer for next question
   */
  resetAndStart(): void {
    console.log('Timer resetAndStart called');
    this.reset();
    this.start();
  }
  /**
   * Handle timer timeout - auto-submit question
   */
  private handleTimeout(): void {
    this.stop();
    
    // Notify timeout callback for auto-submission
    if (this.onTimeout) {
      this.onTimeout();
    }
  }

  /**
   * Get current timer state
   */
  getState(): TimerState {
    return {
      timeRemaining: this.timeRemaining,
      isActive: this.isActive,
      isPaused: this.isPaused
    };
  }

  /**
   * Get remaining time
   */
  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return this.isActive && !this.isPaused;
  }

  /**
   * Set custom callbacks
   */
  setCallbacks(onTick?: TimerCallback, onTimeout?: TimeoutCallback): void {
    this.onTick = onTick || null;
    this.onTimeout = onTimeout || null;
  }

  /**
   * Format time for display (MM:SS)
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get progress percentage (0-100)
   */
  getProgressPercentage(): number {
    return Math.round(((TimerService.QUESTION_DURATION - this.timeRemaining) / TimerService.QUESTION_DURATION) * 100);
  }

  /**
   * Cleanup timer on component unmount
   */
  cleanup(): void {
    this.stop();
    this.onTick = null;
    this.onTimeout = null;
  }
}