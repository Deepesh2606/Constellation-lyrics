import { TrackInfo, LRCLibSearchResult } from '../types';

// In-memory cache per track URI or key
export const lyricsMemoryCache = new Map<string, string>();

/**
 * Fetch lyrics from LRCLIB using plain fetch:
 * 1. GET https://lrclib.net/api/get?track_name=...&artist_name=...&album_name=...&duration=<seconds>
 * 2. If not found, try https://lrclib.net/api/search?q=<artist + track>
 * 3. Cache results per track URI in memory.
 */
export async function fetchLyricsFromLRCLIB(
  track: string,
  artist: string,
  album?: string,
  durationSeconds?: number,
  uri?: string
): Promise<string | null> {
  const cacheKey = uri || `${artist.toLowerCase()} - ${track.toLowerCase()}`;
  if (lyricsMemoryCache.has(cacheKey)) {
    return lyricsMemoryCache.get(cacheKey)!;
  }

  try {
    // 1. Direct get endpoint
    const params = new URLSearchParams();
    if (track) params.append('track_name', track.trim());
    if (artist) params.append('artist_name', artist.trim());
    if (album) params.append('album_name', album.trim());
    if (durationSeconds && durationSeconds > 0) params.append('duration', String(Math.round(durationSeconds)));

    const getUrl = `https://lrclib.net/api/get?${params.toString()}`;
    const getRes = await fetch(getUrl, {
      headers: {
        'User-Agent': 'Spicetify-Constellation-CustomApp/1.0',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      if (data && data.syncedLyrics) {
        lyricsMemoryCache.set(cacheKey, data.syncedLyrics);
        return data.syncedLyrics;
      }
    }

    // 2. Search fallback
    const query = `${artist} ${track}`.trim();
    if (query) {
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Spicetify-Constellation-CustomApp/1.0',
        },
      });

      if (searchRes.ok) {
        const results: LRCLibSearchResult[] = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const matchWithSynced = results.find((r) => r.syncedLyrics && r.syncedLyrics.trim().length > 0);
          if (matchWithSynced && matchWithSynced.syncedLyrics) {
            lyricsMemoryCache.set(cacheKey, matchWithSynced.syncedLyrics);
            return matchWithSynced.syncedLyrics;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[LRCLIB] Fetch failed:', error);
    return null;
  }
}

/**
 * Search LRCLIB directly for search dialog
 */
export async function searchLRCLIB(query: string): Promise<LRCLibSearchResult[]> {
  if (!query || !query.trim()) return [];
  try {
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Spicetify-Constellation-CustomApp/1.0',
      },
    });
    if (!res.ok) return [];
    const list: LRCLibSearchResult[] = await res.json();
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('[LRCLIB] Search error:', e);
    return [];
  }
}

// Preset tracks with synced lyrics for instant out-of-the-box demo
export const PRESET_TRACKS: TrackInfo[] = [
  {
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    durationMs: 230453,
    uri: 'spotify:track:7MXVkk9YM5IZxh0wAE26k8',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    presetLrc: `[00:00.00] (Ooh, yeah)
[00:03.20] (I'm trying to put you in the worst mood, ah)
[00:07.10] (P1 cleaner than your church shoes, ah)
[00:10.50] Milli point two just to hurt you, ah
[00:14.20] All red Lamb' just to tease you, ah
[00:17.80] None of these toys on lease too, ah
[00:21.40] Made your whole year in a week too, yah
[00:25.00] Main bitch out of your league too, ah
[00:28.60] Side bitch out of your league too, ah
[00:32.40] House so empty, need a centipede
[00:35.80] 20 racks a table cut like ebony
[00:39.40] Cut that ivory into skinny pieces
[00:43.00] Then she clean it with her face, man, I love my baby
[00:47.20] You talking about money, I was making that
[00:50.80] Look what you done done, I'm a motherfucking starboy
[00:54.60] Look what you done done, I'm a starboy
[00:58.20] Every day a nigga try to test me, ah
[01:02.00] Every day a nigga try to end me, ah
[01:05.60] Coming for the king, that's a far cry, ah
[01:09.30] I come alive in the fall time, I
[01:13.10] No competition, don't hesitate
[01:16.80] Let's take it higher into outer space
[01:20.40] Look what you done done, I'm a starboy
[01:24.00] Look what you done done, I'm a starboy`,
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    durationMs: 200040,
    uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    presetLrc: `[00:00.00] (Yeah)
[00:13.40] I've been tryna call
[00:16.20] I've been on my own for long enough
[00:20.40] Maybe you can show me how to love, maybe
[00:27.20] I'm going through withdrawals
[00:30.10] You don't even have to do too much
[00:34.20] You can turn me on with just a touch, baby
[00:40.80] I look around and Sin City's cold and empty
[00:47.60] No one's around to judge me
[00:51.20] I can't see clearly when you're gone
[00:55.00] I said, ooh, I'm blinded by the lights
[01:02.20] No, I can't sleep until I feel your touch
[01:09.10] I said, ooh, I'm drowning in the night
[01:16.00] Oh, when I'm like this, you're the one I trust
[01:23.00] I'm running out of time
[01:26.50] 'Cause I can see the sun light up the sky
[01:30.20] So I hit the road in overdrive, baby
[01:37.00] The city's cold and empty
[01:40.50] No one's around to judge me
[01:44.20] I can't see clearly when you're gone
[01:48.00] I said, ooh, I'm blinded by the lights
[01:55.00] No, I can't sleep until I feel your touch`,
  },
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    durationMs: 354320,
    uri: 'spotify:track:4u7EnebtmKWzUH433cf5Qv',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    presetLrc: `[00:00.00] Is this the real life? Is this just fantasy?
[00:07.50] Caught in a landslide, no escape from reality
[00:15.20] Open your eyes, look up to the skies and see
[00:24.00] I'm just a poor boy, I need no sympathy
[00:29.80] Because I'm easy come, easy go, little high, little low
[00:38.20] Any way the wind blows doesn't really matter to me, to me
[00:54.00] Mama, just killed a man
[00:59.80] Put a gun against his head, pulled my trigger, now he's dead
[01:09.00] Mama, life had just begun
[01:15.20] But now I've gone and thrown it all away
[01:23.00] Mama, ooh, didn't mean to make you cry
[01:32.40] If I'm not back again this time tomorrow
[01:37.50] Carry on, carry on as if nothing really matters
[01:51.00] Too late, my time has come
[01:57.20] Sends shivers down my spine, body's aching all the time
[02:05.00] Goodbye, everybody, I've got to go
[02:11.40] Gotta leave you all behind and face the truth
[02:18.50] Mama, ooh, I don't wanna die
[02:26.50] I sometimes wish I'd never been born at all`,
  },
  {
    title: 'Viva La Vida',
    artist: 'Coldplay',
    album: 'Viva La Vida or Death and All His Friends',
    durationMs: 242000,
    uri: 'spotify:track:1mea3bSkSGXuIRvnydlB5b',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80',
    presetLrc: `[00:00.00] (Instrumental Strings)
[00:14.50] I used to rule the world
[00:18.20] Seas would rise when I gave the word
[00:22.00] Now in the morning I sleep alone
[00:25.80] Sweep the streets I used to own
[00:29.50] I used to roll the dice
[00:33.20] Feel the fear in my enemy's eyes
[00:37.00] Listen as the crowd would sing
[00:40.80] Now the old king is dead, long live the king
[00:44.80] One minute I held the key
[00:48.50] Next the walls were closed on me
[00:52.20] And I discovered that my castles stand
[00:56.00] Upon pillars of salt and pillars of sand
[00:59.80] I hear Jerusalem bells a-ringin'
[01:03.50] Roman Cavalry choirs are singing
[01:07.20] Be my mirror, my sword and shield
[01:11.00] My missionaries in a foreign field
[01:14.80] For some reason I can't explain
[01:18.50] Once you'd gone, there was never
[01:21.00] Never an honest word
[01:23.50] And that was when I ruled the world`,
  },
];
