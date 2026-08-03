import { err, ok } from 'neverthrow';

import type { AppError } from '@/core/api/types';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from '@/features/customer/address/api/address.api';
import { useCustomerAddressStore } from '@/features/customer/address/store/address.store';
import type { Address } from '@/features/customer/address/types';

jest.mock('@/features/customer/address/api/address.api', () => ({
  fetchAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
}));

const mockFetchAddresses = fetchAddresses as jest.MockedFunction<typeof fetchAddresses>;
const mockCreateAddress = createAddress as jest.MockedFunction<typeof createAddress>;
const mockUpdateAddress = updateAddress as jest.MockedFunction<typeof updateAddress>;
const mockDeleteAddress = deleteAddress as jest.MockedFunction<typeof deleteAddress>;

const address: Address = {
  uuid: 'addr-1',
  label: 'home',
  address: 'Marina Walk, Dubai Marina',
  apartment: 'Tower 5, Apt 1203',
  lat: 25.0801,
  lng: 55.14,
  is_default: true,
};

const request = {
  label: 'home' as const,
  address: 'Marina Walk, Dubai Marina',
  apartment: 'Tower 5, Apt 1203',
  lat: 25.0801,
  lng: 55.14,
  is_default: true,
};

describe('CustomerAddressStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCustomerAddressStore.setState({
      screenState: { status: 'loading' },
      isMutating: false,
      selectedUuid: null,
    });
  });

  it('initializes with loading state', () => {
    const state = useCustomerAddressStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });

  it('loads addresses into loaded state', async () => {
    mockFetchAddresses.mockResolvedValueOnce(ok([address]));

    await useCustomerAddressStore.getState().load();

    expect(mockFetchAddresses).toHaveBeenCalledTimes(1);
    expect(useCustomerAddressStore.getState().screenState).toEqual({
      status: 'loaded',
      data: [address],
    });
  });

  it('sets empty state when there are no addresses', async () => {
    mockFetchAddresses.mockResolvedValueOnce(ok([]));

    await useCustomerAddressStore.getState().load();

    expect(useCustomerAddressStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('sets error state on load failure', async () => {
    const error: AppError = {
      code: 'SERVER_ERROR',
      message: 'Something went wrong.',
      statusCode: 500,
    };
    mockFetchAddresses.mockResolvedValueOnce(err(error));

    await useCustomerAddressStore.getState().load();

    expect(useCustomerAddressStore.getState().screenState).toEqual({
      status: 'error',
      message: error.message,
    });
  });

  it('adds an address to the list', async () => {
    useCustomerAddressStore.setState({ screenState: { status: 'empty' } });
    mockCreateAddress.mockResolvedValueOnce(ok(address));

    const error = await useCustomerAddressStore.getState().add(request);

    expect(error).toBeNull();
    expect(mockCreateAddress).toHaveBeenCalledWith(request);
    expect(useCustomerAddressStore.getState().screenState).toEqual({
      status: 'loaded',
      data: [address],
    });
  });

  it('returns the error when adding fails', async () => {
    const error: AppError = { code: 'VALIDATION', message: 'Bad input', statusCode: 422 };
    mockCreateAddress.mockResolvedValueOnce(err(error));

    const result = await useCustomerAddressStore.getState().add(request);

    expect(result).toEqual(error);
    expect(useCustomerAddressStore.getState().isMutating).toBe(false);
  });

  it('updates an existing address in place', async () => {
    useCustomerAddressStore.setState({
      screenState: { status: 'loaded', data: [{ ...address, label: 'work' }] },
    });
    mockUpdateAddress.mockResolvedValueOnce(ok(address));

    const error = await useCustomerAddressStore.getState().update('addr-1', { label: 'home' });

    expect(error).toBeNull();
    expect(mockUpdateAddress).toHaveBeenCalledWith('addr-1', { label: 'home' });
    expect(useCustomerAddressStore.getState().screenState).toEqual({
      status: 'loaded',
      data: [address],
    });
  });

  it('removes an address and transitions to empty when none remain', async () => {
    useCustomerAddressStore.setState({ screenState: { status: 'loaded', data: [address] } });
    mockDeleteAddress.mockResolvedValueOnce(ok(undefined));

    const error = await useCustomerAddressStore.getState().remove('addr-1');

    expect(error).toBeNull();
    expect(useCustomerAddressStore.getState().screenState).toEqual({ status: 'empty' });
  });

  it('returns the error when deleting a default address', async () => {
    useCustomerAddressStore.setState({ screenState: { status: 'loaded', data: [address] } });
    const conflict: AppError = {
      code: 'CANNOT_DELETE_DEFAULT',
      message: 'Cannot delete default address',
      statusCode: 409,
    };
    mockDeleteAddress.mockResolvedValueOnce(err(conflict));

    const result = await useCustomerAddressStore.getState().remove('addr-1');

    expect(result).toEqual(conflict);
    expect(useCustomerAddressStore.getState().screenState).toEqual({
      status: 'loaded',
      data: [address],
    });
  });

  it('selects an address for checkout', () => {
    useCustomerAddressStore.getState().selectAddress('addr-1');
    expect(useCustomerAddressStore.getState().selectedUuid).toBe('addr-1');
  });
});
