import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PersistConfig,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { baseApi } from "./fetchers/api/baseApi";
import authReducer from "./fetchers/auth/authSlice";
import inquiryReducer from "./inquirySlice";

// Register all injected endpoint modules
import "./fetchers/auth/authApi";
import "./fetchers/product/productApi";
import "./fetchers/inquiry/inquiryApi";
import "./fetchers/settings/settingsApi";
import "./fetchers/user/userApi";
import "./fetchers/partner/partnerApi";
import "./fetchers/news/newsApi";
import "./fetchers/category/categoryApi";

const persistAuthConfig: PersistConfig<ReturnType<typeof authReducer>> = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
    inquiry: inquiryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
