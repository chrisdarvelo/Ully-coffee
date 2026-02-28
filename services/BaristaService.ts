import AsyncStorage from '@react-native-async-storage/async-storage';
import { Barista, BlogPost } from '../types';

const FOLLOW_KEY_PREFIX = '@ully_barista_follows_';

function followKey(uid: string): string {
  return `${FOLLOW_KEY_PREFIX}${uid}`;
}

const CURATED_BARISTAS: Barista[] = [
  {
    id: 'barista_1',
    name: 'Lina Morales',
    specialty: 'Latte Art & Pour Over',
    bio: 'World Latte Art champion. Specializes in single-origin pour overs and creative milk patterns.',
    avatarSeed: 7701,
    avatarColor: '#6B4226',
    avatarUrl: 'https://i.pravatar.cc/400?img=32',
    recipes: [
      { title: 'Blossoms', url: 'https://perfectdailygrind.com/latte-art-blossom/' },
      { title: 'Cascara Fizz', url: 'https://perfectdailygrind.com/cascara-fizz-recipe/' },
    ],
    blogs: [
      { title: 'The Art of Pouring', url: 'https://perfectdailygrind.com/the-art-of-pouring/' },
      { title: 'Water Temperature Myths', url: 'https://perfectdailygrind.com/water-temperature-myths/' },
    ],
    recommendations: ['Kalita Wave 185', 'Acaia Pearl Scale'],
  },
  {
    id: 'barista_2',
    name: 'James Osei',
    specialty: 'Espresso & Roasting',
    bio: 'Head roaster at Origin Labs. Known for dialing in light roasts on traditional Italian machines.',
    avatarSeed: 8802,
    avatarColor: '#2E4057',
    avatarUrl: 'https://i.pravatar.cc/400?img=68',
    recipes: [
      { title: 'E27', url: 'https://www.baristahustle.com/blog/e27-espresso/' },
      { title: 'Nordic Light', url: 'https://www.baristahustle.com/blog/nordic-light-roast/' },
    ],
    blogs: [
      { title: 'Roast Profiles Decoded', url: 'https://www.baristahustle.com/blog/roast-profiles/' },
      { title: 'Pressure Profiling 101', url: 'https://www.baristahustle.com/blog/pressure-profiling/' },
    ],
    recommendations: ['La Marzocco Linea Mini', 'Niche Zero'],
  },
  {
    id: 'barista_3',
    name: 'Yuki Tanaka',
    specialty: 'Japanese Brewing',
    bio: 'Pioneer of iced pour over and flash brew techniques. Runs a kissaten-style cafe in Kyoto.',
    avatarSeed: 9903,
    avatarColor: '#8B3A3A',
    avatarUrl: 'https://i.pravatar.cc/400?img=9',
    recipes: [
      { title: 'Funky Way', url: 'https://kurasu.kyoto/blogs/kurasu-journal/funky-way-recipe' },
      { title: 'Flash Brew', url: 'https://kurasu.kyoto/blogs/kurasu-journal/flash-brew-recipe' },
    ],
    blogs: [
      { title: 'Kissaten Culture', url: 'https://kurasu.kyoto/blogs/kurasu-journal/kissaten-culture' },
      { title: 'Ice & Extraction', url: 'https://kurasu.kyoto/blogs/kurasu-journal/ice-and-extraction' },
    ],
    recommendations: ['Hario V60', 'Fellow Stagg Kettle'],
  },
  {
    id: 'barista_4',
    name: 'Sofia Lindgren',
    specialty: 'Competition & Cupping',
    bio: 'Three-time national brewers cup finalist. Cupping judge and green coffee buyer.',
    avatarSeed: 1104,
    avatarColor: '#5B6E4E',
    avatarUrl: 'https://i.pravatar.cc/400?img=5',
    recipes: [
      { title: 'Aroma', url: 'https://europeancoffeetrip.com/aroma-recipe/' },
      { title: 'Competition V60', url: 'https://europeancoffeetrip.com/competition-v60/' },
    ],
    blogs: [
      { title: 'Cupping Protocols', url: 'https://europeancoffeetrip.com/cupping-protocols/' },
      { title: 'Buying Green Coffee', url: 'https://europeancoffeetrip.com/buying-green-coffee/' },
    ],
    recommendations: ['Comandante C40', 'Origami Dripper'],
  },
  {
    id: 'barista_5',
    name: 'Marco Di Stefano',
    specialty: 'Traditional Espresso',
    bio: 'Fourth-generation Italian barista. Believes in the simplicity of a perfect ristretto.',
    avatarSeed: 2205,
    avatarColor: '#704214',
    avatarUrl: 'https://i.pravatar.cc/400?img=14',
    recipes: [
      { title: 'Ristretto Classico', url: 'https://www.lacimbali.com/ristretto-classico/' },
      { title: 'Cappuccino Tradizionale', url: 'https://www.lacimbali.com/cappuccino-tradizionale/' },
    ],
    blogs: [
      { title: 'Espresso Is Not a Science', url: 'https://www.lacimbali.com/espresso-not-science/' },
      { title: 'The Perfect Crema', url: 'https://www.lacimbali.com/perfect-crema/' },
    ],
    recommendations: ['Mazzer Mini', 'IMS Precision Basket'],
  },
];

async function getFollowedIds(uid: string): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(followKey(uid));
    return json ? JSON.parse(json) as string[] : [];
  } catch {
    return [];
  }
}

async function setFollowedIds(uid: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(followKey(uid), JSON.stringify(ids));
}

export async function getBaristas(uid: string): Promise<Barista[]> {
  const followedIds = uid ? await getFollowedIds(uid) : [];
  const followedSet = new Set(followedIds);
  return CURATED_BARISTAS.map((b) => ({
    ...b,
    followed: followedSet.has(b.id),
  }));
}

export async function getBarista(uid: string, baristaId: string): Promise<Barista | null> {
  const baristas = await getBaristas(uid);
  return baristas.find((b) => b.id === baristaId) || null;
}

export async function toggleFollow(uid: string, baristaId: string): Promise<boolean> {
  const ids = await getFollowedIds(uid);
  const index = ids.indexOf(baristaId);
  if (index >= 0) {
    ids.splice(index, 1);
  } else {
    ids.push(baristaId);
  }
  await setFollowedIds(uid, ids);
  return index < 0; // returns new followed state
}

export async function getFollowedBlogPosts(uid: string): Promise<BlogPost[]> {
  const followedIds = await getFollowedIds(uid);
  const followedSet = new Set(followedIds);
  const posts: BlogPost[] = [];
  for (const barista of CURATED_BARISTAS) {
    if (!followedSet.has(barista.id)) continue;
    for (const blog of (barista.blogs ?? [])) {
      posts.push({
        title: blog.title,
        url: blog.url,
        source: barista.name,
        baristaAvatarUrl: barista.avatarUrl,
        baristaAvatarColor: barista.avatarColor,
        baristaId: barista.id,
      });
    }
  }
  return posts;
}
