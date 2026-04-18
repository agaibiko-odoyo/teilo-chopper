/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

const AUDIO_FILE_PATH = "/riptide.mp3"; // Place your song in the public folder as our-song.mp3

const NOTES = [
  "You are an absolute ray of sunshine.",
  "The world is so much brighter with you in it.",
  "Your kindness makes a bigger difference than you know.",
  "You are perfectly enough, just as you are.",
  "You have an incredibly beautiful mind.",
  "Your laugh is the best sound in the world.",
  "You bring magic into ordinary moments.",
  "You are capable of wonderful, amazing things.",
  "Your heart is made of pure gold.",
  "You are allowed to take up space and be exactly who you are.",
  "You're doing wonderfully, even on the quiet days.",
  "You inspire people without even trying.",
  "There is so much lovely energy around you.",
  "You handled today with such grace.",
  "Your uniqueness is your superpower.",
  "You make the people around you feel so loved.",
  "You are so strong, and so gentle, all at once.",
  "Every step you take is a beautiful step forward.",
  "You have a uniquely beautiful way of seeing the world.",
  "You deserve all the good things coming your way.",
  "You are wonderfully and beautifully made.",
  "Your smile can completely light up a room.",
  "You have such a comforting and warm presence.",
  "You are brave, even when it doesn't feel like it.",
  "You make the world a kinder place.",
  "You are surrounded by love and light.",
  "Everything you touch turns a little bit more beautiful.",
  "You are a rare and precious gem.",
  "Your soul is as sweet as cotton candy.",
  "You have the courage to bloom wherever you are planted.",
  "You bring a spark of joy wherever you go.",
  "You are doing your best, and your best is amazing.",
  "It is a privilege to know someone as lovely as you.",
  "You radiate positivity and warmth.",
  "You are allowed to rest and simply be.",
  "You handle challenges like a magical warrior.",
  "The universe is conspiring to make you smile today.",
  "You carry starlight in your eyes.",
  "You are worthy of the softest, sweetest unconditional love.",
  "You are an absolute masterpiece in progress.",
  "Your energy is like a soft, comforting hug.",
  "You are deeply appreciated, today and always.",
  "You have so much to offer the great big world.",
  "Your gentleness is your most beautiful strength.",
  "You are a spark of magic in a normal world.",
  "It's okay to take things one little beautiful step at a time.",
  "You are loved, not for what you do, but for who you are.",
  "You are exactly where you need to be right now.",
  "Your light shines even on the absolute cloudiest days.",
  "Never forget how completely wonderful you are."
];

const AmbientParticles = () => {
  const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    isHeart: Math.random() > 0.6,
    left: `${Math.random() * 100}vw`,
    duration: `${15 + Math.random() * 25}s`,
    delay: `-${Math.random() * 30}s`,
    size: `${12 + Math.random() * 14}px`,
    drift: `${-150 + Math.random() * 300}px`,
    rotate: `${-360 + Math.random() * 720}deg`,
    opacity: 0.2 + Math.random() * 0.4
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="ambient-particle"
          style={{
            '--fall-left': p.left,
            '--fall-duration': p.duration,
            '--fall-delay': p.delay,
            '--fall-size': p.size,
            '--fall-drift': p.drift,
            '--fall-rotate': p.rotate,
            '--fall-opacity': p.opacity
          } as any}
        >
          {p.isHeart ? (
            <Heart className="w-full h-full fill-current" />
          ) : (
            <div className="w-full h-full bg-current" style={{ borderRadius: '50% 0 50% 50%' }} />
          )}
        </div>
      ))}
    </div>
  );
};

const REMINDERS = [
  { title: "Home League Weekend GameMania", date: "2026-04-26", type: 'calendar' },
  { title: "Cookout challenge, Amazing BF vs Cute 5ft GF", date: "2026-05-01", type: 'calendar' },
  { title: "Your Birthday", date: "2026-06-15", type: 'star' },
  { title: "Our Anniversary", date: "2026-10-17", type: 'heart' },
  { title: "Sip N Paint, Home --V", date: "2026-06-06", type: 'calendar' },
  { title: "Picnic at Karura", date: "2026-05-23", type: 'calendar' }
];

const LITTLE_REMINDERS = [
  "I was just thinking about that time we walked through town together on a saturday afternoon. You looked so happy, and I realized then how lucky I am to be the one walking beside you.",
  "Remember when we couldn't stop laughing at that silly joke? Those moments with you are my absolute favorite.",
  "I just caught myself smiling re-reading our old messages. You always know exactly how to make my day.",
  "Sometimes I just pause and appreciate how incredibly lucky I am to have you in my life.",
  "Thinking about your smile right now. It completely melts my heart every single time.",
  "I love how we can do absolutely nothing together and it still feels like the best day ever.",
  "You have this amazing ability to make everything feel okay, just by being you.",
  "Just a little reminder that you are my favorite part of every single day.",
  "I was thinking about how much you've grown and how proud I am of the person you are.",
  "No matter how busy things get, you are always the best thought in my mind."
];

export default function App() {
  const [noteIndex, setNoteIndex] = useState(0);
  const [hugParticles, setHugParticles] = useState<{ id: number, x: number; y: number, isMobile?: boolean }[]>([]);
  const [activeReminders, setActiveReminders] = useState<typeof REMINDERS>([]);
  const [littleReminderText, setLittleReminderText] = useState(LITTLE_REMINDERS[0]);
  const [hoursSinceUpdate, setHoursSinceUpdate] = useState(0);

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    // Generate a daily index based on local timezone date, ensuring no consecutive duplicates
    const getLocalDayNumber = () => {
      const now = new Date();
      // Adjust by timezone offset to get local day boundaries
      return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
    };

    const currentLocalDay = Math.max(0, getLocalDayNumber());
    
    // Seeded PRNG function 
    const prng = (seed: number) => {
      let t = seed + 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    // Calculate up to current day from epoch to guarantee daily changes
    // without repeating the same message 2 days in a row
    let prevIndex = 0; 
    for (let day = 0; day <= currentLocalDay; day++) {
      const randomVal = prng(day);
      const jump = Math.floor(randomVal * (NOTES.length - 1)); // Random jump between 0 and N-2
      
      // If the jump lands on or past yesterday's choice, increment by 1
      // This strictly prevents picking prevIndex again while maintaining perfectly uniform randomness among the other N-1 options
      const nextIndex = jump >= prevIndex ? jump + 1 : jump;
      prevIndex = nextIndex;
    }
    
    setNoteIndex(prevIndex);

    // Randomize reminders every 2 hours
    const twoHourBlock = Math.floor(Date.now() / (2 * 60 * 60 * 1000));
    
    // Seeded shuffle for reminders
    const shuffledReminders = [...REMINDERS];
    for (let i = shuffledReminders.length - 1; i > 0; i--) {
      // Use the 2-hour block as seed, combined with the array index
      const randomVal = prng(twoHourBlock * 100 + i);
      const j = Math.floor(randomVal * (i + 1));
      [shuffledReminders[i], shuffledReminders[j]] = [shuffledReminders[j], shuffledReminders[i]];
    }
    
    // Pick all reminders
    setActiveReminders(shuffledReminders);

    // Pick a little reminder text using the same seeded two-hour block
    const reminderIndex = Math.floor(prng(twoHourBlock * 10) * LITTLE_REMINDERS.length);
    setLittleReminderText(LITTLE_REMINDERS[reminderIndex]);

    // Calculate how many hours since the block started (0 or 1 basically)
    const currentHour = new Date().getHours();
    const hoursSince = currentHour % 2;
    setHoursSinceUpdate(hoursSince);
  }, []);

  const triggerHug = async (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 24 : 42;

    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: Date.now() + i,
      x: startX,
      y: startY,
      isMobile
    }));

    setHugParticles(prev => [...prev, ...newParticles]);

    // Cleanup after animation
    setTimeout(() => {
      setHugParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 3000);

    // Trigger the backend to send the email notification!
    try {
      const response = await fetch('/api/send-hug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        console.error('Failed to send hug email notification');
      }
    } catch (err) {
      console.error('Network error triggering hug notification', err);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6 relative overflow-hidden">
      <AmbientParticles />
      
      {/* Cute Audio Player Pill */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="z-50 mb-6 flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/50 shadow-[0_8px_20px_rgba(255,159,178,0.15)] text-[var(--color-hero-text)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffafbd]/10 to-[#ffc3a0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Music size={16} className={`relative z-10 ${isPlaying ? 'animate-bounce text-[#be123c]' : 'text-[var(--color-tag)]'}`} />
        <span className="relative z-10 font-sans text-[11px] font-bold tracking-[2px] uppercase opacity-80 mr-2 text-[#9a6a6a]">Our Song</span>
        
        <button onClick={togglePlay} className="relative z-10 text-[#9a6a6a] hover:text-[#be123c] transition-colors hover:scale-110 active:scale-95">
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        
        <button onClick={toggleMute} className="relative z-10 text-[#9a6a6a] hover:text-[#be123c] transition-colors hover:scale-110 active:scale-95 ml-1">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <audio ref={audioRef} src={AUDIO_FILE_PATH} loop />
      </motion.div>

      <div className="w-full max-w-[940px] grid grid-cols-1 md:grid-cols-4 md:grid-rows-4 gap-5 md:min-h-[680px] z-10">
        
        {/* 1. Hero Card (Main Note Card, spans 3 cols, 2 rows) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:col-start-1 md:col-end-4 md:row-start-1 md:row-end-3 bg-[var(--color-hero-bg)] rounded-[32px] p-[30px] bento-shadow border border-[var(--color-card-border)] flex flex-col justify-center items-center text-center relative overflow-hidden"
        >
          <span className="absolute top-5 right-5 text-[40px] text-[var(--color-tag)] opacity-30 pointer-events-none">❤</span>
          <div className="text-[14px] uppercase tracking-[2px] text-[var(--color-tag)] mb-4 font-semibold font-sans">
            My Love, Teilo Chopper 
          </div>
          <h2 className="font-serif text-[32px] md:text-[48px] italic font-normal leading-[1.2] text-[var(--color-hero-text)] m-0">
            "{NOTES[noteIndex]}"
          </h2>
          <span className="absolute bottom-5 left-5 text-[24px] text-[var(--color-tag)] opacity-30 pointer-events-none">❤</span>
        </motion.div>

        {/* 2. Date Card (Top Right: col 4, row 1) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="md:col-start-4 md:col-end-5 md:row-start-1 md:row-end-2 rounded-[32px] p-5 bento-shadow bg-gradient-to-br from-[#ffafbd] to-[#ffc3a0] text-white flex flex-col items-center justify-center border-none"
        >
          <div className="text-[40px] font-bold leading-none">{new Date().getDate()}</div>
          <div className="text-[16px] uppercase tracking-[2px] mt-1 font-sans">{new Date().toLocaleString('default', { month: 'long' })}</div>
          <p className="font-sans text-[10px] tracking-wide uppercase opacity-80 mt-2">A daily note for you</p>
        </motion.div>

        {/* 3. Extra Note Card (Swapped to Right Side Bar: col 4, rows 2-4) */}
        {/* On Mobile: Renders 3rd */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="md:col-start-4 md:col-end-5 md:row-start-2 md:row-end-5 bg-[var(--color-note-bg)] rounded-[32px] p-[30px] bento-shadow border border-[var(--color-card-border)] flex flex-col relative"
        >
          <div className="text-[14px] uppercase tracking-[2px] text-[var(--color-tag)] mb-4 font-semibold font-sans">A Little Reminder</div>
          <p className="text-[16px] md:text-[18px] leading-[1.6] text-[var(--color-note-text)] font-serif italic m-0">
            {littleReminderText}
          </p>
          <div className="absolute bottom-[15px] right-[15px] text-[11px] text-[#d1c1c1] uppercase tracking-[1px] font-sans">
            Updated {hoursSinceUpdate === 0 ? "recently" : "1 hour ago"}
          </div>
        </motion.div>

        {/* 4. Hug Card (Bottom Left: col 1, rows 3-4) */}
        {/* On Mobile: Renders 4th */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="md:col-start-1 md:col-end-2 md:row-start-3 md:row-end-5 bg-[var(--color-hug-bg)] rounded-[32px] p-[30px] bento-shadow border border-[var(--color-card-border)] flex flex-col justify-between items-center cursor-pointer transition-transform hover:-translate-y-1"
          onClick={triggerHug}
        >
          <div className="text-[14px] uppercase tracking-[2px] text-[var(--color-tag)] font-semibold font-sans text-center">Send a Hug</div>
          <button className="bg-[var(--color-tag)] w-[80px] h-[80px] rounded-full flex items-center justify-center text-white text-[30px] shadow-[0_8px_20px_rgba(255,159,178,0.3)] transition-transform hover:scale-110 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-tag)] opacity-50"></span>
            🤗
          </button>
          <div className="text-[14px] text-center text-[var(--color-bento-text)]">Press for warmth</div>
        </motion.div>

        {/* 5. Reminders / Calendar Card (Swapped to inner cols 2-3, rows 3-4) */}
        {/* On Mobile: Renders 5th */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="md:col-start-2 md:col-end-4 md:row-start-3 md:row-end-5 bg-[var(--color-card-bg)] rounded-[32px] p-[30px] bento-shadow border border-[var(--color-card-border)] flex flex-col"
        >
          <div className="text-[14px] uppercase tracking-[2px] text-[var(--color-tag)] mb-5 font-semibold font-sans">Coming Up</div>
          <div className="flex-1 flex flex-col gap-4">
            {activeReminders.map((reminder, idx) => {
              const isAnniversary = reminder.title.toLowerCase().includes('anniversary');
              // Romantic red for anniversary, else standard pastel cycle
              const pastels = ['#ff9fb2', '#c3e8bd', '#bde0fe', '#ffe1a8', '#e2c6ff', '#ffd6e0'];
              const dotColor = isAnniversary ? '#be123c' : pastels[idx % pastels.length];

              return (
                <div key={idx} className="flex items-start group mt-1">
                  <div 
                    className="w-[12px] h-[12px] rounded-full mr-[15px] shrink-0 mt-1" 
                    style={{ backgroundColor: dotColor }}
                  ></div>
                  <div className="flex flex-col">
                    <span className="font-serif font-medium italic text-[16px] text-[#9a6a6a] leading-tight" title={reminder.title}>{reminder.title}</span>
                    <div className="font-sans text-[13px] text-[#b49292] mt-0.5">
                      {formatDate(reminder.date)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* Hug Particles Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {hugParticles.map(p => {
            const angle = Math.random() * Math.PI * 2;
            const spreadRadius = p.isMobile ? 150 : 300;
            const distance = (p.isMobile ? 50 : 100) + Math.random() * spreadRadius;
            const endX = p.x + Math.cos(angle) * distance;
            const endY = p.y + Math.sin(angle) * distance - (p.isMobile ? 120 : 200);
            const scale = 0.5 + Math.random() * 1.5;
            const rotation = -45 + Math.random() * 90;

            return (
              <motion.div
                key={p.id}
                initial={{ x: p.x, y: p.y, opacity: 1, scale: 0, rotate: 0 }}
                animate={{ x: endX, y: endY, opacity: 0, scale, rotate: rotation }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 + Math.random() * 1.5, ease: "easeOut" }}
                className="absolute w-8 h-8 drop-shadow-sm flex items-center justify-center -ml-4 -mt-4 text-[var(--color-tag)]"
              >
                {Math.random() > 0.5 ? (
                  <Heart className="w-full h-full fill-current" />
                ) : (
                  <Heart className="w-6 h-6 fill-[var(--color-hero-bg)]" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
