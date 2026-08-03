import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Input } from '@/core/ui/Input';
import { ScreenHeader } from '@/core/ui/ScreenHeader';

import { useCustomerAddress } from '../hooks/useCustomerAddress';
import { addressSchema } from '../schemas/address.schema';
import type { Address, AddressLabel, AddressRequest } from '../types';

const LABEL_OPTIONS: AddressLabel[] = ['home', 'work', 'other'];

interface FormErrors {
  label?: string;
  address?: string;
  lat?: string;
  lng?: string;
}

export default function CustomerAddressFormScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { address: addressParam } = useLocalSearchParams<{ address?: string }>();
  const { add, update, isMutating } = useCustomerAddress();

  const initialAddress = useMemo<Address | null>(() => {
    if (typeof addressParam !== 'string' || addressParam.length === 0) return null;
    try {
      return JSON.parse(addressParam) as Address;
    } catch {
      return null;
    }
  }, [addressParam]);

  const editingUuid = initialAddress?.uuid ?? null;

  const [label, setLabel] = useState<AddressLabel>(initialAddress?.label ?? 'home');
  const [address, setAddress] = useState(initialAddress?.address ?? '');
  const [apartment, setApartment] = useState(initialAddress?.apartment ?? '');
  const [lat, setLat] = useState(initialAddress != null ? String(initialAddress.lat) : '0');
  const [lng, setLng] = useState(initialAddress != null ? String(initialAddress.lng) : '0');
  const [isDefault, setIsDefault] = useState(initialAddress?.is_default ?? false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSave = async () => {
    const result = addressSchema.safeParse({
      label,
      address,
      apartment: apartment.trim().length > 0 ? apartment.trim() : undefined,
      lat,
      lng,
      is_default: isDefault,
    });

    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (field && !nextErrors[field]) {
          nextErrors[field] = t(issue.message);
        }
      }
      setErrors(nextErrors);
      return;
    }

    const payload: AddressRequest = {
      label: result.data.label,
      address: result.data.address,
      apartment: result.data.apartment,
      lat: result.data.lat,
      lng: result.data.lng,
      is_default: result.data.is_default,
    };

    const error = editingUuid ? await update(editingUuid, payload) : await add(payload);

    if (error) {
      Alert.alert(t('customer.address.saveErrorTitle'), error.message);
      return;
    }

    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScreenHeader
        title={editingUuid ? t('customer.address.editTitle') : t('customer.address.addTitle')}
        rightElement={
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel={t('common.cancel')}>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: theme.fontWeight.medium,
                color: theme.colors.primary[600],
              }}
            >
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 96 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Label selector */}
        <View style={{ marginBottom: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.neutral[700],
              marginBottom: theme.spacing.xs,
            }}
          >
            {t('customer.address.labelField')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {LABEL_OPTIONS.map((option) => {
              const isSelected = label === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setLabel(option)}
                  accessibilityLabel={t(`customer.address.${option}`)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    flex: 1,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.radius.sm,
                    alignItems: 'center',
                    backgroundColor: isSelected
                      ? theme.colors.primary[500]
                      : theme.colors.neutral[100],
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: theme.colors.neutral[200],
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      fontWeight: theme.fontWeight.medium,
                      color: isSelected ? theme.colors.neutral[0] : theme.colors.neutral[700],
                    }}
                  >
                    {t(`customer.address.${option}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.label ? (
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.colors.semantic.error,
                marginTop: theme.spacing.xs,
              }}
            >
              {errors.label}
            </Text>
          ) : null}
        </View>

        <Input
          label={t('customer.address.addressField')}
          placeholder={t('customer.address.addressPlaceholder')}
          value={address}
          onChangeText={(text) => {
            setAddress(text);
            setErrors((prev) => ({ ...prev, address: undefined }));
          }}
          error={errors.address}
          multiline
        />

        <Input
          label={t('customer.address.apartmentField')}
          placeholder={t('customer.address.apartmentPlaceholder')}
          value={apartment}
          onChangeText={setApartment}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input
              label={t('customer.address.latitude')}
              placeholder={t('customer.address.coordinatePlaceholder')}
              value={lat}
              onChangeText={(text) => {
                setLat(text);
                setErrors((prev) => ({ ...prev, lat: undefined }));
              }}
              error={errors.lat}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t('customer.address.longitude')}
              placeholder={t('customer.address.coordinatePlaceholder')}
              value={lng}
              onChangeText={(text) => {
                setLng(text);
                setErrors((prev) => ({ ...prev, lng: undefined }));
              }}
              error={errors.lng}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Default toggle */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: theme.spacing.sm,
          }}
        >
          <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[900] }}>
            {t('customer.address.isDefault')}
          </Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] }}
            thumbColor={theme.colors.neutral[0]}
          />
        </View>
      </ScrollView>

      {/* Sticky Save bar */}
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
          title={
            editingUuid ? t('customer.address.saveChanges') : t('customer.address.saveAddress')
          }
          onPress={handleSave}
          size="lg"
          loading={isMutating}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
