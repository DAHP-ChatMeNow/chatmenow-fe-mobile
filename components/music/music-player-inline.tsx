"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Music2 } from "lucide-react";
import { MusicTrack } from "@/types/music";

interface MusicPlayerInlineProps {
    track: {
        url?: string | null;
        title?: string | null;
        artist?: string | null;
        coverUrl?: string | null;
    };
    autoPlay?: boolean;
    className?: string;
}

export function MusicPlayerInline({ track, autoPlay = false, className = "" }: MusicPlayerInlineProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => {
            setProgress(audio.currentTime);
        };
        const onLoaded = () => {
            setDuration(audio.duration || 0);
        };
        const onEnded = () => setPlaying(false);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !track.url) return;
        if (autoPlay) {
            audio.play().then(() => setPlaying(true)).catch(() => { });
        }
    }, [autoPlay, track.url]);

    const formatTime = (s: number) => {
        if (!isFinite(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio || !track.url) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(() => setPlaying(true)).catch(() => { });
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Number(e.target.value);
    };

    if (!track.url) return null;

    return (
        <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 ${className}`}>
            {track.url && <audio ref={audioRef} src={track.url} preload="metadata" />}

            {/* Cover */}
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/30 flex items-center justify-center shrink-0">
                {track.coverUrl ? (
                    <img src={track.coverUrl} alt={track.title || "Cover"} className="w-full h-full object-cover" />
                ) : (
                    <Music2 className="w-4 h-4 text-primary" />
                )}
            </div>

            {/* Info + Progress */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{track.title || "Unknown"}</p>
                <p className="text-[10px] text-white/60 truncate leading-tight">{track.artist || ""}</p>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-white/50 tabular-nums">{formatTime(progress)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 1}
                        value={progress}
                        onChange={handleSeek}
                        className="flex-1 h-1 accent-primary cursor-pointer"
                    />
                    <span className="text-[10px] text-white/50 tabular-nums">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Play button */}
            <button
                onClick={togglePlay}
                className="shrink-0 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center"
                aria-label={playing ? "Pause" : "Play"}
            >
                {playing ? (
                    <Pause className="w-3.5 h-3.5 text-white fill-white" />
                ) : (
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                )}
            </button>
        </div>
    );
}
