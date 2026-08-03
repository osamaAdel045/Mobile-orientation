import { create } from 'zustand';

import type { AppError } from '@/core/api/types';

import { createAddress, deleteAddress, fetchAddresses, updateAddress } from '../api/address.api';
import type { Address, AddressRequest } from '../types';

type ScreenState =
  | { status: 'loading' }
  | { status: 'loaded'; data: Address[] }
  | { status: 'error'; message: string }
  | { status: 'empty' };

interface AddressStore {
  screenState: ScreenState;
  isMutating: boolean;
  selectedUuid: string | null;

  load: () => Promise<void>;
  add: (input: AddressRequest) => Promise<AppError | null>;
  update: (uuid: string, input: Partial<AddressRequest>) => Promise<AppError | null>;
  remove: (uuid: string) => Promise<AppError | null>;
  selectAddress: (uuid: string) => void;
}

export const useCustomerAddressStore = create<AddressStore>((set, get) => ({
  screenState: { status: 'loading' },
  isMutating: false,
  selectedUuid: null,

  load: async () => {
    set({ screenState: { status: 'loading' } });

    const result = await fetchAddresses();

    result.match(
      (data) => {
        if (data.length === 0) {
          set({ screenState: { status: 'empty' } });
        } else {
          set({ screenState: { status: 'loaded', data } });
        }
      },
      (error: AppError) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },

  add: async (input) => {
    set({ isMutating: true });

    const result = await createAddress(input);

    return result.match(
      (address) => {
        const { screenState } = get();
        const data = screenState.status === 'loaded' ? [...screenState.data, address] : [address];
        set({ screenState: { status: 'loaded', data }, isMutating: false });
        return null;
      },
      (error: AppError) => {
        set({ isMutating: false });
        return error;
      },
    );
  },

  update: async (uuid, input) => {
    set({ isMutating: true });

    const result = await updateAddress(uuid, input);

    return result.match(
      (updated) => {
        const { screenState } = get();
        if (screenState.status === 'loaded') {
          const data = screenState.data.map((address) =>
            address.uuid === uuid ? updated : address,
          );
          set({ screenState: { status: 'loaded', data }, isMutating: false });
        } else {
          set({ isMutating: false });
        }
        return null;
      },
      (error: AppError) => {
        set({ isMutating: false });
        return error;
      },
    );
  },

  remove: async (uuid) => {
    set({ isMutating: true });

    const result = await deleteAddress(uuid);

    return result.match(
      () => {
        const { screenState } = get();
        if (screenState.status === 'loaded') {
          const data = screenState.data.filter((address) => address.uuid !== uuid);
          set({
            screenState: data.length === 0 ? { status: 'empty' } : { status: 'loaded', data },
            isMutating: false,
          });
        } else {
          set({ isMutating: false });
        }
        return null;
      },
      (error: AppError) => {
        set({ isMutating: false });
        return error;
      },
    );
  },

  selectAddress: (uuid) => {
    set({ selectedUuid: uuid });
  },
}));
