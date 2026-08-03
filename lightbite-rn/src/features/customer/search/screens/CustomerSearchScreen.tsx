import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { MMKVStorage } from '@/core/storage/mmkv-storage';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { fetchRestaurants } from '@/features/customer/home/api/home.api';
import type { Restaurant } from '@/features/customer/home/types';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;
const SEARCH_DEBOUNCE_MS = 300;

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; data: Restaurant[] }
  | { status: 'error'; message: string };

async function getRecentSearches(): Promise<string[]> {
  const raw = await MMKVStorage.getString(RECENT_SEARCHES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

async function saveRecentSearch(term: string): Promise<void> {
  const trimmed = term.trim();
  if (!trimmed) return;
  const existing = (await getRecentSearches()).filter((item) => item !== trimmed);
  const next = [trimmed, ...existing].slice(0, MAX_RECENT_SEARCHES);
  await MMKVStorage.setString(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

async function clearRecentSearches(): Promise<void> {
  await MMKVStorage.delete(RECENT_SEARCHES_KEY);
}

export default function CustomerSearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setState({ status: 'idle' });
      return;
    }
    setState({ status: 'loading' });
    fetchRestaurants({ query: trimmed, sort: 'distance' }).then((result) => {
      result.match(
        ({ restaurants }) =>
          setState({
            status: 'loaded',
            data: restaurants,
          }),
        (error) => setState({ status: 'error', message: error.message }),
      );
    });
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (!text.trim()) {
        setState({ status: 'idle' });
        return;
      }
      debounceRef.current = setTimeout(() => runSearch(text), SEARCH_DEBOUNCE_MS);
    },
    [runSearch],
  );

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    saveRecentSearch(query).then(() => getRecentSearches().then(setRecentSearches));
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    runSearch(query);
  }, [query, runSearch]);

  const handleRecentPress = useCallback(
    (term: string) => {
      setQuery(term);
      runSearch(term);
    },
    [runSearch],
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleRestaurantPress = useCallback(
    (restaurant: Restaurant) => {
      if (query.trim()) {
        saveRecentSearch(query).then(() => getRecentSearches().then(setRecentSearches));
      }
      router.push(`/(customer)/restaurant/${restaurant.uuid}`);
    },
    [query, router],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const renderHeader = () => (
    <View
      style={{
        backgroundColor: theme.colors.neutral[0],
        paddingHorizontal: theme.spacing.md,
        paddingTop: insets.top + theme.spacing.md,
        paddingBottom: theme.spacing.sm,
      }}
    >
      <TextInput
        autoFocus
        value={query}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        placeholder={t('customer.searchRestaurants')}
        placeholderTextColor={theme.colors.neutral[400]}
        accessibilityLabel={t('customer.searchRestaurants')}
        style={{
          height: 44,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.neutral[100],
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.fontSize.base,
          color: theme.colors.neutral[900],
        }}
      />
    </View>
  );

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity onPress={() => handleRestaurantPress(item)} activeOpacity={0.8}>
      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={{ flexDirection: 'row' }}>
          {item.logo_url ? (
            <Image
              source={{ uri: item.logo_url }}
              style={{
                width: 80,
                height: 80,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.neutral[100],
              }}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.neutral[100],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: theme.fontSize['2xl'], color: theme.colors.neutral[300] }}>
                {'\u{1F37D}'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.neutral[900],
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.neutral[500],
                marginTop: 2,
              }}
            >
              {item.cuisine_types.join(', ')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: theme.spacing.xs,
              }}
            >
              {item.rating != null ? (
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.primary[500],
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {`★ ${item.rating.toFixed(1)}`}
                </Text>
              ) : null}
              {item.review_count != null ? (
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.neutral[400],
                    marginLeft: theme.spacing.sm,
                  }}
                >
                  {`(${item.review_count})`}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', marginTop: theme.spacing.xs }}>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[500] }}>
                {`${item.delivery_time_min} min`}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.colors.neutral[500],
                  marginLeft: theme.spacing.sm,
                }}
              >
                {`• ${item.delivery_fee}`}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderRecentRow = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleRecentPress(item)}
      activeOpacity={0.8}
      style={{ paddingVertical: theme.spacing.sm }}
      accessibilityRole="button"
    >
      <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[700] }}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.base,
          fontWeight: theme.fontWeight.semibold,
          color: theme.colors.neutral[700],
        }}
      >
        {t('customer.searchScreen.recentSearches')}
      </Text>
      {recentSearches.length > 0 ? (
        <TouchableOpacity
          onPress={handleClearRecent}
          accessibilityRole="button"
          accessibilityLabel={t('customer.searchScreen.clearRecent')}
        >
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.primary[600] }}>
            {t('customer.searchScreen.clearRecent')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (state.status === 'idle') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <FlatList
          data={recentSearches}
          keyExtractor={(item) => item}
          renderItem={renderRecentRow}
          ListHeaderComponent={renderRecentHeader}
          ListEmptyComponent={<EmptyState message={t('customer.searchScreen.searchPrompt')} />}
          contentContainerStyle={{ padding: theme.spacing.md }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <ErrorDisplay message={state.message} onRetry={() => runSearch(query)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {renderHeader()}
      {state.data.length === 0 ? (
        <EmptyState message={t('common.noResults')} />
      ) : (
        <FlatList
          data={state.data}
          keyExtractor={(item) => item.uuid}
          renderItem={renderRestaurantCard}
          contentContainerStyle={{ padding: theme.spacing.md }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}
