import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HERO_IMAGE } from '../constants/images';

const { width } = Dimensions.get('window');

// Caption metrics were measured off the design mockup at a 334px content
// width; scale them so the block keeps its proportions on any device.
const MOCK_W = 334;
const hs = (n) => (Math.min(width, 430) * n) / MOCK_W;

// The artwork is square. Height is derived from the capped width so the hero
// doesn't blow up on wide web viewports.
const MAX_W = Math.min(width, 430);
const HERO_ASPECT = 1;
const HERO_HEIGHT = MAX_W / HERO_ASPECT;

const HomeScreen = () => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.logo}>MyShoppy</Text>
        <Text style={styles.logoDot}>•</Text>
      </View>

      <View style={styles.heroBanner}>
        <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="contain" />
        <LinearGradient colors={['#B7DCEB', '#DBEBEE']} style={styles.heroText}>
          <Text style={styles.heroTitle}>Shopping And{'\n'}Department Store.</Text>
          <Text style={styles.heroSub}>
            Shopping is a bit of a relaxing hobby for me, which is sometimes
            troubling for the bank balance.
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2A7F7F',
    letterSpacing: -0.5,
  },
  logoDot: {
    fontSize: 24,
    color: '#F5A623',
    marginLeft: 2,
  },
  heroBanner: {},
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
    flexShrink: 0,
    backgroundColor: '#B7DCEB',
  },
  heroText: {
    paddingHorizontal: hs(9),
    paddingTop: hs(2),
    paddingBottom: hs(12),
  },
  heroTitle: {
    fontSize: hs(38),
    lineHeight: hs(43),
    fontWeight: '800',
    color: '#04342C',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: hs(11.5),
    lineHeight: hs(17),
    color: '#0C3C34',
    marginTop: hs(16),
  },
});

export default HomeScreen;
