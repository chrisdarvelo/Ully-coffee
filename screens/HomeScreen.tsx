import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/FirebaseConfig';
import { getProfile } from '../services/ProfileService';
import { getNews } from '../services/NewsService';
import { getRecipes } from '../services/RecipeService';
import { getCafes } from '../services/CafeService';
import { getBaristas, getFollowedBlogPosts } from '../services/BaristaService';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import CoffeeFlower from '../components/CoffeeFlower';
import SectionRow from '../components/SectionRow';
import RecipeArtCover from '../components/RecipeArtCover';
import SideDrawer from '../components/SideDrawer';
import { GoldGradient } from '../components/GoldGradient';
import HomeSkeleton from '../components/HomeSkeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Recipe, Barista, Cafe, NewsArticle, BlogPost } from '../types';

const CARD_WIDTH = 150;
const CARD_HEIGHT = 200;

const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1524350876685-274059332603?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1611070960620-f0e3e2b1d082?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=300&h=200&fit=crop',
];

const COFFEE_IMAGES = [
  'https://images.unsplash.com/photo-1524350876685-274059332603?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1611070960620-f0e3e2b1d082?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=300&h=200&fit=crop',
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const user = auth.currentUser;
  const name = user?.email ? user.email.split('@')[0] : 'barista';
  const uid = user?.uid;

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => (uid ? getProfile(uid) : null),
    enabled: !!uid,
  });

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ['news'],
    queryFn: getNews,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes', uid],
    queryFn: () => (uid ? getRecipes(uid) : []),
    enabled: !!uid,
  });

  const { data: baristas = [], isLoading: baristasLoading } = useQuery({
    queryKey: ['baristas', uid],
    queryFn: () => (uid ? getBaristas(uid) : []),
    enabled: !!uid,
  });

  const { data: cafes = [], isLoading: cafesLoading } = useQuery({
    queryKey: ['cafes', uid],
    queryFn: () => (uid ? getCafes(uid) : []),
    enabled: !!uid,
  });

  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['blogs', uid],
    queryFn: () => (uid ? getFollowedBlogPosts(uid) : []),
    enabled: !!uid,
  });

  const onRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: ['news'] });
    queryClient.invalidateQueries({ queryKey: ['recipes', uid] });
    queryClient.invalidateQueries({ queryKey: ['baristas', uid] });
    queryClient.invalidateQueries({ queryKey: ['cafes', uid] });
    queryClient.invalidateQueries({ queryKey: ['blogs', uid] });
  };

  const handleDrawerNavigate = (key: string) => {
    setDrawerOpen(false);
    if (key === 'ai' || key === 'resources') {
      navigation.navigate('AI');
    } else if (key === 'editProfile' || key === 'settings') {
      navigation.navigate('Profile');
    }
  };

  const renderNewsCard = ({ item, index }: { item: NewsArticle; index: number }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => Linking.openURL(item.link)}
      activeOpacity={0.7}
    >
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: COFFEE_IMAGES[index % COFFEE_IMAGES.length] }}
          style={styles.cardImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardSource}>{item.source}</Text>
        <Text style={styles.cardTitle} numberOfLines={3}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      activeOpacity={0.7}
    >
      <View style={styles.recipeArtWrap}>
        <RecipeArtCover artSeed={item.artSeed} artStyle={item.artStyle} size={CARD_WIDTH - 24} />
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>{item.method}</Text>
    </TouchableOpacity>
  );

  const renderBaristaCard = ({ item }: { item: Barista }) => (
    <TouchableOpacity
      style={styles.baristaCard}
      onPress={() => navigation.navigate('BaristaDetail', { barista: item })}
      activeOpacity={0.7}
    >
      <View>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={[styles.baristaPhoto, item.followed && styles.baristaPhotoFollowed]} />
        ) : (
          <View style={[styles.baristaAvatarFallback, { backgroundColor: item.avatarColor || Colors.primary }]}>
            <Text style={styles.baristaAvatarText}>
              {item.name.split(' ').map((w) => w[0]).join('')}
            </Text>
          </View>
        )}
        {item.followed && (
          <View style={styles.followBadge}>
            <Text style={styles.followBadgeText}>{'\u2713'}</Text>
          </View>
        )}
      </View>
      <Text style={styles.baristaName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
    </TouchableOpacity>
  );

  const renderCafeCard = ({ item, index }: { item: Cafe; index: number }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => navigation.navigate('CafeDetail', { cafe: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: CAFE_IMAGES[index % CAFE_IMAGES.length] }}
          style={styles.cardImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
        {item.location ? (
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.location}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderBlogCard = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.7}
    >
      <View style={styles.blogHeader}>
        <Image
          source={{ uri: item.baristaAvatarUrl }}
          style={styles.bloggerAvatar}
        />
        <Text style={styles.cardSource}>{item.source}</Text>
      </View>
      <Text style={styles.blogTitle} numberOfLines={4}>{item.title}</Text>
    </TouchableOpacity>
  );

  const refreshing = queryClient.isFetching() > 0;
  const isLoadingInitial = (newsLoading || recipesLoading || baristasLoading || cafesLoading || blogsLoading) && !refreshing;

  if (isLoadingInitial) {
    return <HomeSkeleton />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setDrawerOpen(true)}
            activeOpacity={0.7}
            style={{ borderRadius: 20, overflow: 'hidden' }}
          >
            {profile?.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.profileBtnImage} />
            ) : (
              <GoldGradient style={styles.profileBtn}>
                <Text style={styles.profileBtnText}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </GoldGradient>
            )}
          </TouchableOpacity>
        </View>

        <View>
          <SectionRow
            title="Your Recipes"
            data={recipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item: any) => item.id}
            onAdd={() => navigation.navigate('RecipeDetail', { isNew: true })}
            emptyText="No Recipes"
            emptyDescription="Tap + to create your first dial-in recipe."
          />
        </View>

        <View>
          <SectionRow
            title="Daily News"
            data={news}
            renderItem={renderNewsCard}
            keyExtractor={(item: any, i: number) => `news-${i}`}
            emptyText="No News"
            emptyDescription="Pull down to refresh your coffee news feed."
          />
        </View>

        <View>
          <SectionRow
            title="Baristas"
            data={baristas}
            renderItem={renderBaristaCard}
            keyExtractor={(item: any) => item.id}
            emptyText="No Baristas"
            emptyDescription="Explore and follow your favorite baristas."
          />
        </View>

        <View>
          <SectionRow
            title="Cafes"
            data={cafes}
            renderItem={renderCafeCard}
            keyExtractor={(item: any) => item.id}
            onAdd={() => navigation.navigate('CafeDetail', { isNew: true })}
            emptyText="No Cafes"
            emptyDescription="Save your favorite coffee shops here."
          />
        </View>

        <View>
          <SectionRow
            title="Blogs"
            data={blogs}
            renderItem={renderBlogCard}
            keyExtractor={(item: any, i: number) => `blog-${i}`}
            emptyText="No Posts"
            emptyDescription="Follow baristas to see their latest blog posts here."
          />
        </View>
      </ScrollView>

      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleDrawerNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtnImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileBtnText: {
    color: AuthColors.buttonText,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  loadingWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'flex-start',
  },
  imageCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardImageWrap: {
    position: 'relative',
  },
  cardImage: {
    width: CARD_WIDTH,
    height: 90,
    backgroundColor: Colors.border,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 35,
  },
  cardBody: {
    flex: 1,
    padding: 10,
  },
  cardSource: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontWeight: '600',
    lineHeight: 18,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 4,
  },
  blogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  blogTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 4,
  },
  bloggerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    marginRight: 8,
  },
  recipeArtWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  baristaCard: {
    width: 130,
    alignItems: 'center',
    paddingVertical: 8,
  },
  baristaPhoto: {
    width: 126,
    height: 126,
    borderRadius: 63,
    marginBottom: 10,
    backgroundColor: Colors.border,
  },
  baristaPhotoFollowed: {
    borderWidth: 3,
    borderColor: '#C8923C',
  },
  followBadge: {
    position: 'absolute',
    bottom: 8,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C8923C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  followBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  baristaAvatarFallback: {
    width: 126,
    height: 126,
    borderRadius: 63,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  baristaAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  baristaName: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontWeight: '600',
    textAlign: 'center',
  },
});
