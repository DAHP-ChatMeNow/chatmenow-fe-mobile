export interface MusicTrack {
    id?: string;        // jamendoId or mock-N
    _id?: string;       // MongoDB _id (when cached)
    jamendoId: string;
    title: string;
    artist: string;
    url: string;
    coverUrl?: string | null;
    duration: number;   // seconds
    source: "jamendo" | "mock" | string;
}
