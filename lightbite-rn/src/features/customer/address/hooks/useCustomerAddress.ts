import { useCallback } from 'react';

import { useCustomerAddressStore } from '../store/address.store';

export function useCustomerAddress() {
  const screenState = useCustomerAddressStore((s) => s.screenState);
  const isMutating = useCustomerAddressStore((s) => s.isMutating);
  const selectedUuid = useCustomerAddressStore((s) => s.selectedUuid);
  const load = useCustomerAddressStore((s) => s.load);
  const add = useCustomerAddressStore((s) => s.add);
  const update = useCustomerAddressStore((s) => s.update);
  const remove = useCustomerAddressStore((s) => s.remove);
  const selectAddress = useCustomerAddressStore((s) => s.selectAddress);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return {
    screenState,
    isMutating,
    selectedUuid,
    add,
    update,
    remove,
    selectAddress,
    refresh,
  };
}
