/* eslint-disable no-underscore-dangle */
import ChromeStorage from '@utils/storage';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { persistReducer, persistStore, PersistConfig } from 'redux-persist';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import NftDataStateReducer from './nftData/reducer';
import walletReducer from './wallet/reducer';
import { WalletState } from './wallet/actions/types';

export const storage = new ChromeStorage(chrome.storage.local, chrome.runtime);

export const persistVersion = 1;

const rootPersistConfig = {
  version: 1,
  key: 'root',
  storage,
  blacklist: ['walletState'],
};

export const WalletPersistConfig: PersistConfig<WalletState> = {
  version: 1,
  key: 'walletState',
  storage,
  blacklist: ['seedPhrase'],
  transforms: [
    encryptTransform(
      {
        secretKey: process.env.STORE_ENCRYPTION_KEY,
        onError: (error) => true,
      },
    ),
  ],
};

const appReducer = combineReducers({
  walletState: persistReducer(WalletPersistConfig, walletReducer),
  nftDataState: NftDataStateReducer,
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export type StoreState = ReturnType<typeof rootReducer>;

const rootStore = (() => {
  const storeMiddleware = [
    createStateSyncMiddleware({
      // We don't want to sync the redux-persist actions
      blacklist: ['persist/PERSIST', 'persist/REHYDRATE'],
    }),
  ];
  const store = createStore(persistedReducer, applyMiddleware(...storeMiddleware));
  const persistedStore = persistStore(store);
  initMessageListener(store);

  return { store, persistedStore };
})();

export default rootStore;
