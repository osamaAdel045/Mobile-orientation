import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = { key: string; color: string };

const SLIDES: Slide[] = [
  { key: 'slide1', color: '#FFF7ED' },
  { key: 'slide2', color: '#FFEDD5' },
  { key: 'slide3', color: '#FED7AA' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View
            style={{
              width: SCREEN_WIDTH,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing.xl,
              backgroundColor: item.color,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize['2xl'],
                fontWeight: theme.fontWeight.bold,
                color: theme.colors.primary[700],
                textAlign: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              {t(`onboarding.${item.key}.title`)}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.colors.neutral[700],
                textAlign: 'center',
              }}
            >
              {t(`onboarding.${item.key}.description`)}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          paddingVertical: theme.spacing.md,
        }}
      >
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === currentIndex ? theme.colors.primary[500] : theme.colors.neutral[200],
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
      >
        <Button
          title={t('onboarding.skip')}
          onPress={() => router.replace('/(auth)/login')}
          variant="ghost"
        />
        <Button title={t('onboarding.next')} onPress={goNext} />
      </View>
    </View>
  );
}
