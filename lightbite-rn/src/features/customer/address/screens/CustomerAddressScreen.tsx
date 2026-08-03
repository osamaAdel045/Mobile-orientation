import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { Skeleton } from '@/core/ui/Skeleton';

import { useCustomerAddress } from '../hooks/useCustomerAddress';
import type { Address, AddressLabel } from '../types';

const LABEL_ICONS: Record<AddressLabel, string> = {
  home: '\u{1F3E0}',
  work: '\u{1F4BC}',
  other: '\u{1F4CD}',
};

interface Props {
  selectionMode?: boolean;
  onSelect?: (address: Address) => void;
}

export default function CustomerAddressScreen({ selectionMode = false, onSelect }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { screenState, isMutating, remove, refresh } = useCustomerAddress();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddPress = () => {
    router.push('/(customer)/address-form');
  };

  const handleEditPress = (address: Address) => {
    router.push({
      pathname: '/(customer)/address-form',
      params: { address: JSON.stringify(address) },
    });
  };

  const handleCardPress = (address: Address) => {
    if (selectionMode) {
      onSelect?.(address);
      return;
    }
    handleEditPress(address);
  };

  const handleDeletePress = (address: Address) => {
    Alert.alert(
      t('customer.address.delete'),
      t('customer.address.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('customer.address.delete'),
          style: 'destructive',
          onPress: async () => {
            const error = await remove(address.uuid);
            if (error) {
              Alert.alert(t('customer.address.deleteErrorTitle'), error.message);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (screenState.status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.neutral[0],
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        <Skeleton
          width={200}
          height={theme.fontSize['2xl']}
          style={{ marginBottom: theme.spacing.lg }}
        />
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Skeleton width={44} height={44} borderRadius={theme.radius.full} />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Skeleton width={120} height={18} style={{ marginBottom: theme.spacing.xs }} />
                <Skeleton width={220} height={14} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    );
  }

  if (screenState.status === 'error') {
    return <ErrorDisplay message={screenState.message} onRetry={refresh} />;
  }

  const data = screenState.status === 'loaded' ? screenState.data : [];

  const renderItem = ({ item }: { item: Address }) => (
    <Card style={{ marginBottom: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => handleCardPress(item)}
          activeOpacity={0.7}
          accessibilityLabel={item.address}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.primary[50],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg }}>{LABEL_ICONS[item.label]}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Text
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.neutral[900],
                }}
              >
                {t(`customer.address.${item.label}`)}
              </Text>
              {item.is_default ? (
                <View
                  style={{
                    backgroundColor: theme.colors.semantic.successLight,
                    borderRadius: theme.radius.full,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.xs,
                      fontWeight: theme.fontWeight.medium,
                      color: theme.colors.semantic.success,
                    }}
                  >
                    {t('customer.address.default')}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.neutral[500],
                marginTop: theme.spacing.xs,
              }}
              numberOfLines={2}
            >
              {item.address}
            </Text>
            {item.apartment ? (
              <Text
                style={{
                  fontSize: theme.fontSize.xs,
                  color: theme.colors.neutral[400],
                  marginTop: theme.spacing.xs,
                }}
              >
                {item.apartment}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {!selectionMode ? (
          <View style={{ marginLeft: theme.spacing.sm, alignItems: 'flex-end' }}>
            <TouchableOpacity
              onPress={() => handleEditPress(item)}
              accessibilityLabel={t('customer.address.edit')}
              disabled={isMutating}
              style={{ marginBottom: theme.spacing.sm }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.medium,
                  color: theme.colors.primary[600],
                }}
              >
                {t('customer.address.edit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePress(item)}
              accessibilityLabel={t('customer.address.delete')}
              disabled={isMutating}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.medium,
                  color: theme.colors.semantic.error,
                }}
              >
                {t('customer.address.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScreenHeader
        title={selectionMode ? t('customer.address.selectTitle') : t('customer.address.title')}
      />

      {screenState.status === 'loaded' ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: theme.spacing.md,
            paddingBottom: 96 + insets.bottom,
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <EmptyState message={t('customer.address.noAddresses')} />
        </View>
      )}

      {/* Sticky Add bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: theme.colors.neutral[0],
          ...theme.shadows.lg,
        }}
      >
        <Button
          title={t('customer.address.addNew')}
          onPress={handleAddPress}
          size="lg"
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
