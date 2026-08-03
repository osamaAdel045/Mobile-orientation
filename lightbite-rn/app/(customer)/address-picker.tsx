import { useRouter } from 'expo-router';

import { useCustomerAddress } from '@/features/customer/address/hooks/useCustomerAddress';
import CustomerAddressScreen from '@/features/customer/address/screens/CustomerAddressScreen';

export default function AddressPickerRoute() {
  const router = useRouter();
  const { selectAddress } = useCustomerAddress();

  return (
    <CustomerAddressScreen
      selectionMode
      onSelect={(address) => {
        selectAddress(address.uuid);
        router.back();
      }}
    />
  );
}
